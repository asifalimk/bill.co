import { AfterViewInit, Component, HostListener, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';
import { BillingService } from './billing.service';
import { InventoryService } from './inventory.service';
import { ThemeService } from './theme.service';
import { TranslationPipe, TranslationService } from './translation.service';
import { CartLine, Customer, Item, ItemCategory, ItemUnit, Receipt, RefundMode } from './models';
import { PosCounterComponent } from './components/pos-counter.component';
import { InventoryComponent } from './components/inventory.component';
import { PurchasesComponent } from './components/purchases.component';
import { SalesReturnComponent } from './components/sales-return.component';
import { InvoiceHistoryComponent } from './components/invoice-history.component';
import { CustomersComponent } from './components/customers.component';
import { VendorsComponent } from './components/vendors.component';
import { CustomerService } from './customer.service';
import { VendorService } from './vendor.service';
import { CompanyProfileService } from './company-profile.service';
import { Vendor } from './models';
import { SettingsComponent } from './components/settings.component';

type ViewName = 'billing' | 'inventory' | 'purchases' | 'returns' | 'invoices' | 'customers' | 'vendors' | 'settings';

interface PurchaseLine {
  item: Item;
  quantity: number;
  purchaseCost: number;
  sellingPrice: number;
}

interface PurchaseHistoryEntry {
  invoiceNo: string;
  vendorId: number | null;
  vendorName: string;
  vendorCompany: string;
  date: string;
}

interface ReturnLine {
  original: CartLine;
  quantity: number;
  refundUnitPrice: number;
  reason: 'Damaged' | 'Excess';
  restock: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslationPipe, PosCounterComponent, InventoryComponent, PurchasesComponent, SalesReturnComponent, InvoiceHistoryComponent, CustomersComponent, VendorsComponent, SettingsComponent],
  templateUrl: './app.component.html'
})
export class AppComponent implements AfterViewInit {
  readonly auth = inject(AuthService);
  readonly billing = inject(BillingService);
  readonly inventory = inject(InventoryService);
  readonly customerService = inject(CustomerService);
  readonly vendorService = inject(VendorService);
  readonly companyProfileService = inject(CompanyProfileService);
  readonly theme = inject(ThemeService);
  readonly translations = inject(TranslationService);
  readonly profile = this.companyProfileService.profile;
  readonly viewModel = this;
  readonly activeView = signal<ViewName>('billing');
  readonly query = signal('');
  readonly selectedSuggestion = signal(0);
  readonly inventorySearch = signal('');
  readonly itemQuantity = signal(1);
  readonly lineDiscount = signal(0);
  readonly activeSelectedItem = signal<Item | null>(null);
  readonly stockWarning = signal('');
  readonly receipt = signal<Receipt | null>(null);
  readonly editingInvoice = signal<Receipt | null>(null);
  readonly alert = signal('');
  readonly loginError = signal('');
  readonly itemModalOpen = signal(false);
  readonly suggestions = computed(() => {
    const text = this.query().trim().toLowerCase();
    if (!text || /^\d{3}$/.test(text)) {
      return [];
    }
    return this.inventory.items()
      .filter(item => item.code.includes(text) || item.name.toLowerCase().includes(text))
      .slice(0, 7);
  });
  customerMatches(): Customer[] {
    const text = this.customerName.trim().toLowerCase();
    if (!text || this.selectedCustomerId !== null) return [];
    return this.customerService.customers()
      .filter(customer => customer.name.toLowerCase().includes(text) || customer.phone.includes(text))
      .slice(0, 5);
  }
  readonly filteredItems = computed(() => {
    const text = this.inventorySearch().trim().toLowerCase();
    return this.inventory.items().filter(item =>
      item.code.includes(text) || item.name.toLowerCase().includes(text)
    );
  });
  readonly purchaseMatches = computed(() => {
    const text = this.purchaseCode().trim().toLowerCase();
    if (!text || /^\d{3}$/.test(text)) {
      return [];
    }
    return this.inventory.items()
      .filter(item => item.code.includes(text) || item.name.toLowerCase().includes(text))
      .slice(0, 5);
  });
  readonly savedReceipts = this.billing.completedInvoices;
  readonly purchaseLines = signal<PurchaseLine[]>([]);
  readonly purchaseHistory = signal<PurchaseHistoryEntry[]>([]);
  readonly purchaseCode = signal('');
  readonly purchaseQuantity = signal(1);
  readonly purchaseUnitCost = signal(0);
  readonly purchaseSellingPrice = signal(0);
  readonly returnInvoiceQuery = signal('');
  readonly selectedReturnReceipt = signal<Receipt | null>(null);
  readonly returnLines = signal<ReturnLine[]>([]);
  readonly refundMode = signal<RefundMode>('Cash Refund');
  readonly returnHistory = signal<string[]>([]);
  readonly returnedQuantities = signal<Record<string, number>>({});
  readonly selectedCartIndex = signal(0);
  readonly today = new Date();

  loginUsername = '';
  loginPassword = '';
  loginPin = '';
  customerName = '';
  customerPhone = '';
  selectedCustomerId: number | null = null;
  siteNote = '';
  quickCustomerOpen = false;
  quickCustomerAddress = '';
  quickCustomerGstin = '';
  selectedVendorId: number | null = null;
  vendorName = '';
  vendorInvoice = '';
  quickVendorCompanyName = '';
  quickVendorContactName = '';
  quickVendorPhone = '';
  quickVendorGstin = '';
  purchaseDate = new Date().toISOString().slice(0, 10);
  newItemCode = '';
  newItemName = '';
  newItemCategory: ItemCategory = 'Plumbing';
  newItemUnit: ItemUnit = 'Pcs';
  newItemCost = 0;
  newItemPrice = 0;
  newItemStock = 0;
  newItemMinStock = 20;

  ngAfterViewInit(): void {
    const initialView = this.viewFromPath(window.location.pathname);
    if (initialView && (!['inventory', 'purchases', 'returns', 'vendors', 'settings'].includes(initialView) || this.auth.isAdmin())) {
      this.activeView.set(initialView);
    }
    this.focusSearch();
  }

  @HostListener('document:keydown', ['$event'])
  handleGlobalKeydown(event: KeyboardEvent): void {
    if (event.defaultPrevented) {
      return;
    }
    if (event.key === 'F11') {
      event.preventDefault();
      this.translations.toggleLanguage();
      return;
    }
    if (event.key === 'F12' || (event.key.toLowerCase() === 't' && event.ctrlKey && event.shiftKey)) {
      event.preventDefault();
      this.theme.toggle();
      return;
    }
    if (!this.auth.user()) {
      return;
    }
    if ((event.key === 'F3' || (event.ctrlKey && event.key.toLowerCase() === 'n')) && this.activeView() === 'billing') {
      event.preventDefault();
      setTimeout(() => document.getElementById('site-note')?.focus());
      return;
    }
    if (event.key === 'F5' && this.activeView() === 'billing' && this.billing.lines().length) {
      event.preventDefault();
      document.getElementById(`cart-row-${this.selectedCartIndex()}`)?.focus();
      return;
    }
    if (event.key === 'F4') {
      event.preventDefault();
      this.navigate('billing');
      setTimeout(() => document.getElementById('customer-name')?.focus());
      return;
    }
    if (event.key === 'F2') {
      event.preventDefault();
      this.navigate('billing');
      setTimeout(() => this.focusSearch());
    } else if (event.key === 'F8') {
      event.preventDefault();
      this.navigate('billing');
      setTimeout(() => document.getElementById('discount-input')?.focus());
    } else if (event.key === 'F9') {
      event.preventDefault();
      this.checkout('CASH');
    } else if (event.key === 'F10') {
      event.preventDefault();
      this.checkout('CREDIT');
    } else if (event.key === 'Escape') {
      if (this.receipt()) {
        this.receipt.set(null);
      } else {
        this.resetTransaction();
      }
    } else if (event.key === 'Delete' && this.activeView() === 'billing' &&
        !['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes((event.target as HTMLElement).tagName)) {
      const line = this.billing.lines()[this.selectedCartIndex()];
      if (line) {
        event.preventDefault();
        this.billing.remove(line.item.id);
        this.selectedCartIndex.set(Math.max(0, Math.min(this.selectedCartIndex(), this.billing.lines().length - 1)));
      }
    }
  }

  login(): void {
    const successful = this.auth.login(this.loginUsername, this.loginPassword, this.loginPin);
    this.loginError.set(successful ? '' : 'Login did not match. Use the demo credentials below.');
    if (successful) {
      this.loginPassword = '';
      this.loginPin = '';
      this.navigate('billing');
      setTimeout(() => this.focusSearch());
    }
  }

  navigate(view: ViewName): void {
    if (['inventory', 'purchases', 'returns', 'vendors', 'settings'].includes(view) && !this.auth.isAdmin()) {
      this.notify('Inventory, purchases, returns, and settings are available to admins only.');
      return;
    }
    this.activeView.set(view);
    const path = view === 'billing' ? '/' : `/${view === 'returns' ? 'returns' : view}`;
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
  }

  @HostListener('window:popstate')
  restoreViewFromPath(): void {
    const view = this.viewFromPath(window.location.pathname);
    if (view && (!['inventory', 'purchases', 'returns', 'vendors', 'settings'].includes(view) || this.auth.isAdmin())) {
      this.activeView.set(view);
    }
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
    this.selectedSuggestion.set(0);
    this.stockWarning.set('');
    if (!this.activeSelectedItem() && /^\d{3}$/.test(value)) {
      const exact = this.inventory.findByCode(value);
      if (exact) {
        this.selectItem(exact);
      }
    }
  }

  availableToAdd(item: Item): number {
    const currentItem = this.inventory.items().find(candidate => candidate.id === item.id);
    if (!currentItem) return 0;
    const inCart = this.billing.lines()
      .find(line => line.item.id === item.id)?.quantity ?? 0;
    const originalQuantity = this.editingInvoice()?.lines
      .find(line => line.item.id === item.id)?.quantity ?? 0;
    return Math.max(0, currentItem.stock_qty + originalQuantity - inCart);
  }

  stockIsLow(item: Item): boolean {
    const available = this.availableToAdd(item);
    const currentItem = this.inventory.items().find(candidate => candidate.id === item.id);
    return available > 0 && currentItem !== undefined && available < currentItem.min_stock_level;
  }

  showStockWarning(message: string): void {
    this.stockWarning.set(message);
    this.notify(message);
  }

  handleSearchKeydown(event: KeyboardEvent): void {
    const matches = this.suggestions();
    if (event.key === 'ArrowDown' && matches.length) {
      event.preventDefault();
      this.selectedSuggestion.update(index => Math.min(index + 1, matches.length - 1));
    } else if (event.key === 'ArrowUp' && matches.length) {
      event.preventDefault();
      this.selectedSuggestion.update(index => Math.max(index - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (this.activeSelectedItem()) {
        this.focusQuantity();
        return;
      }
      const exact = this.inventory.findByCode(this.query().trim());
      const selected = exact ?? matches[this.selectedSuggestion()];
      if (selected) {
        this.selectItem(selected);
      }
    }
  }

  selectItem(item: Item): void {
    const available = this.availableToAdd(item);
    if (available <= 0) {
      const currentItem = this.inventory.items().find(candidate => candidate.id === item.id);
      this.showStockWarning((currentItem?.stock_qty ?? 0) <= 0
        ? `Out of Stock! Available: 0 ${item.unit}.`
        : `Insufficient stock! No additional ${item.unit} available.`);
      return;
    }

    this.activeSelectedItem.set(item);
    this.query.set('');
    const searchInput = document.getElementById('itemSearch') as HTMLInputElement | null;
    if (searchInput) {
      searchInput.value = '';
    }
    this.selectedSuggestion.set(0);
    this.itemQuantity.set(1);
    this.lineDiscount.set(0);
    this.stockWarning.set('');
    this.alert.set('');
    this.focusQuantity();
  }

  private focusQuantity(): void {
    setTimeout(() => {
      const quantityInput = document.getElementById('item-quantity') as HTMLInputElement | null;
      quantityInput?.focus();
      quantityInput?.select();
    });
  }

  updateCustomerLookup(value: string): void {
    this.customerName = value;
    this.selectedCustomerId = null;
    const exactPhone = this.customerService.findByPhone(value);
    if (exactPhone) this.selectCustomer(exactPhone);
  }

  updateCustomerPhone(value: string): void {
    this.customerPhone = value;
    this.selectedCustomerId = null;
    const customer = this.customerService.findByPhone(value);
    if (customer) this.selectCustomer(customer);
  }

  selectCustomer(customer: Customer): void {
    this.selectedCustomerId = customer.id;
    this.customerName = customer.name;
    this.customerPhone = customer.phone;
  }

  selectCustomerById(customerId: number | null): void {
    this.selectedCustomerId = customerId;
    if (customerId === null) {
      this.customerName = '';
      this.customerPhone = '';
      return;
    }
    const customer = this.customerService.findById(customerId);
    if (customer) {
      this.customerName = customer.name;
      this.customerPhone = customer.phone;
    }
  }

  createCustomerFromPos(): void {
    try {
      const customer = this.customerService.add({
        name: this.customerName,
        phone: this.customerPhone,
        address: this.quickCustomerAddress,
        gstin: this.quickCustomerGstin
      });
      this.selectCustomer(customer);
      this.quickCustomerAddress = '';
      this.quickCustomerGstin = '';
      this.quickCustomerOpen = false;
      this.notify('Customer added successfully.');
    } catch (error) {
      this.notify(this.errorMessage(error));
    }
  }

  selectedPurchaseVendor(): Vendor | undefined {
    return this.selectedVendorId !== null ? this.vendorService.findById(this.selectedVendorId) : undefined;
  }

  commitStagedItem(): void {
    const item = this.activeSelectedItem();
    if (!item) {
      this.notify('Search for an item first.');
      this.focusSearch();
      return;
    }
    const quantity = Number(this.itemQuantity());
    const available = this.availableToAdd(item);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      this.showStockWarning('Quantity must be greater than zero.');
      return;
    }
    if (available <= 0) {
      this.activeSelectedItem.set(null);
      const currentItem = this.inventory.items().find(candidate => candidate.id === item.id);
      this.showStockWarning((currentItem?.stock_qty ?? 0) <= 0
        ? `Out of Stock! Available: 0 ${item.unit}.`
        : `Insufficient stock! No additional ${item.unit} available.`);
      return;
    }
    if (quantity > available) {
      this.itemQuantity.set(available);
      this.showStockWarning(`Insufficient stock! Only ${available} ${item.unit} available. Quantity capped; press Enter to confirm.`);
      this.focusQuantity();
      return;
    }
    try {
      this.billing.add(item, quantity, Number(this.lineDiscount()));
      this.selectedCartIndex.set(this.billing.lines().findIndex(line => line.item.id === item.id));
      this.activeSelectedItem.set(null);
      this.itemQuantity.set(1);
      this.lineDiscount.set(0);
      this.selectedSuggestion.set(0);
      this.alert.set('');
      this.stockWarning.set('');
      setTimeout(() => this.focusSearch());
    } catch (error) {
      this.notify(this.errorMessage(error));
    }
  }

  addSearchedItem(): void {
    if (this.activeSelectedItem()) {
      this.commitStagedItem();
      return;
    }
    const text = this.query().trim();
    const item = this.inventory.findByCode(text) ?? this.suggestions()[this.selectedSuggestion()];
    if (item) {
      this.selectItem(item);
    } else {
      this.notify('Search for an item first.');
    }
  }

  updateBillDiscount(value: number): void {
    this.billing.billDiscount.set(Number.isFinite(value) ? Math.max(0, value) : 0);
  }

  updateCartLine(itemId: number, field: 'quantity' | 'discount', value: number): void {
    try {
      if (field === 'quantity') {
        const item = this.inventory.items().find(candidate => candidate.id === itemId);
        if (!item) throw new Error('The selected item no longer exists in inventory.');
        const originalQuantity = this.editingInvoice()?.lines
          .find(line => line.item.id === itemId)?.quantity ?? 0;
        const availableMaximum = item.stock_qty + originalQuantity;
        if (!Number.isFinite(Number(value)) || Number(value) <= 0) {
          throw new Error('Quantity must be greater than zero.');
        }
        if (Number(value) > availableMaximum) {
          this.billing.updateLine(itemId, 'quantity', availableMaximum);
          this.showStockWarning(`Insufficient stock! Maximum quantity is ${availableMaximum} ${item.unit}.`);
          return;
        }
      }
      this.billing.updateLine(itemId, field, Number(value));
      this.stockWarning.set('');
      this.alert.set('');
    } catch (error) {
      this.notify(this.errorMessage(error));
    }
  }

  handleCartRowKeydown(event: KeyboardEvent, index: number): void {
    if (event.target !== event.currentTarget) {
      return;
    }
    const nextIndex = event.key === 'ArrowDown' ? index + 1 : event.key === 'ArrowUp' ? index - 1 : index;
    if (nextIndex !== index) {
      event.preventDefault();
      this.selectedCartIndex.set(Math.max(0, Math.min(nextIndex, this.billing.lines().length - 1)));
      document.getElementById(`cart-row-${this.selectedCartIndex()}`)?.focus();
    }
  }

  editInvoice(invoice: Receipt): void {
    this.editingInvoice.set(invoice);
    this.billing.lines.set(invoice.lines.map(line => ({
      ...line,
      item: { ...line.item }
    })));
    this.billing.billDiscount.set(invoice.discount);
    this.billing.paymentType.set(invoice.paymentType);
    this.customerName = invoice.customerName;
    this.customerPhone = invoice.customerPhone;
    this.siteNote = invoice.site_note ?? '';
    this.selectedCustomerId = invoice.customerId ?? this.customerService.findByPhone(invoice.customerPhone)?.id ?? null;
    this.activeSelectedItem.set(null);
    this.query.set('');
    this.itemQuantity.set(1);
    this.lineDiscount.set(0);
    this.selectedCartIndex.set(0);
    this.receipt.set(null);
    this.navigate('billing');
    this.alert.set(`Editing invoice ${invoice.invoiceNo}.`);
  }

  cancelInvoiceEdit(): void {
    this.editingInvoice.set(null);
    this.resetTransaction();
  }

  checkout(payment: 'CASH' | 'CREDIT'): void {
    if (!this.billing.lines().length) {
      this.notify('Add at least one item before checkout.');
      return;
    }
    if (payment === 'CREDIT' && (!this.customerName.trim() || !/^\d{7,15}$/.test(this.customerPhone.trim()))) {
      this.billing.paymentType.set('CREDIT');
      this.notify('Credit sale requires a customer name and a valid 7–15 digit phone number.');
      setTimeout(() => {
        const fieldId = this.customerName.trim() ? 'customer-phone' : 'customer-name';
        document.getElementById(fieldId)?.focus();
      });
      return;
    }
    const invoiceBeingEdited = this.editingInvoice();
    const quantityDeltas = new Map<number, number>();
    invoiceBeingEdited?.lines.forEach(line =>
      quantityDeltas.set(line.item.id, (quantityDeltas.get(line.item.id) ?? 0) - line.quantity)
    );
    this.billing.lines().forEach(line =>
      quantityDeltas.set(line.item.id, (quantityDeltas.get(line.item.id) ?? 0) + line.quantity)
    );
    const stockError = [...quantityDeltas.entries()].find(([itemId, delta]) => {
      const item = this.inventory.items().find(candidate => candidate.id === itemId);
      return !item || item.stock_qty - delta < 0;
    });
    if (stockError) {
      const item = this.inventory.items().find(candidate => candidate.id === stockError[0]);
      const available = item?.stock_qty ?? 0;
      this.notify(item
        ? `Not enough stock for ${item.name}. Available: ${available}.`
        : 'An item in this invoice no longer exists in inventory.');
      return;
    }
    try {
      const phone = this.customerPhone.trim();
      let customer = this.selectedCustomerId !== null
        ? this.customerService.findById(this.selectedCustomerId)
        : undefined;
      if (!customer || customer.phone !== phone) {
        customer = phone ? this.customerService.findByPhone(phone) : undefined;
      }
      if (payment === 'CREDIT' && !customer) {
        customer = this.customerService.add({
          name: this.customerName,
          phone,
          address: this.quickCustomerAddress,
          gstin: this.quickCustomerGstin
        });
      }
      const lines = this.billing.lines().map(line => ({ ...line, item: { ...line.item } }));
      quantityDeltas.forEach((delta, itemId) => { if (delta) this.inventory.adjustStock(itemId, -delta); });
      const totalCost = lines.reduce((total, line) => total + (line.item.purchase_price * line.quantity), 0);
      const grossAmount = lines.reduce((total, line) => total + (line.item.selling_price * line.quantity), 0);
      const lineDiscountTotal = lines.reduce((total, line) => total + line.discount, 0);
      const overallBillDiscount = Math.min(this.billing.billDiscount(), this.billing.subtotal());
      const totalDiscounts = lineDiscountTotal + overallBillDiscount;
      const netAmount = Math.max(0, grossAmount - totalDiscounts);
      const netProfit = netAmount - totalCost;
      const newReceipt: Receipt = {
        ...(invoiceBeingEdited ?? {}),
        invoiceNo: invoiceBeingEdited?.invoiceNo ?? `INV-${String(Date.now()).slice(-7)}`,
        date: invoiceBeingEdited?.date ?? new Date(),
        cashier: invoiceBeingEdited?.cashier ?? this.auth.user()?.displayName ?? 'Cashier',
        paymentType: payment,
        customerName: customer?.name ?? this.customerName.trim(),
        customerPhone: customer?.phone ?? phone,
        customerGstin: customer?.gstin ?? (this.quickCustomerGstin.trim() || undefined),
        customerId: customer?.id,
        site_note: this.siteNote.trim(),
        lines,
        subtotal: this.billing.subtotal(),
        discount: overallBillDiscount,
        total: netAmount,
        total_cost: totalCost,
        gross_amount: grossAmount,
        total_discounts: totalDiscounts,
        net_amount: netAmount,
        net_profit: netProfit,
        isEdited: Boolean(invoiceBeingEdited),
        ...(invoiceBeingEdited ? {
          editedAt: new Date(),
          editedBy: this.auth.user()?.displayName ?? 'Cashier'
        } : {})
      };
      const previousCustomerId = invoiceBeingEdited?.customerId;
      const previousWasTrackedCredit = invoiceBeingEdited?.paymentType === 'CREDIT' && previousCustomerId !== undefined;
      const nextIsCredit = payment === 'CREDIT' && customer !== undefined;
      if (previousWasTrackedCredit && previousCustomerId === customer?.id && nextIsCredit) {
        this.customerService.adjustCreditBalance(customer.id, newReceipt.total - invoiceBeingEdited.total);
      } else {
        if (previousWasTrackedCredit && previousCustomerId !== undefined) {
          this.customerService.adjustCreditBalance(previousCustomerId, -invoiceBeingEdited.total);
        }
        if (nextIsCredit && customer) {
          this.customerService.adjustCreditBalance(customer.id, newReceipt.total);
        }
      }
      if (invoiceBeingEdited) {
        this.billing.updateInvoice(newReceipt);
        this.editingInvoice.set(null);
        this.alert.set('Invoice updated successfully.');
      } else {
        this.savedReceipts.update(receipts => [newReceipt, ...receipts]);
        this.alert.set('');
      }
      this.receipt.set(newReceipt);
      this.billing.clear();
      this.activeSelectedItem.set(null);
      this.selectedCartIndex.set(0);
      this.customerName = '';
      this.customerPhone = '';
      this.selectedCustomerId = null;
      this.siteNote = '';
      this.quickCustomerOpen = false;
    } catch (error) {
      this.notify(this.errorMessage(error));
    }
  }

  resetTransaction(): void {
    this.billing.clear();
    this.editingInvoice.set(null);
    this.activeSelectedItem.set(null);
    this.selectedCartIndex.set(0);
    this.query.set('');
    this.itemQuantity.set(1);
    this.lineDiscount.set(0);
    this.customerName = '';
    this.customerPhone = '';
    this.selectedCustomerId = null;
    this.siteNote = '';
    this.quickCustomerOpen = false;
    this.alert.set('');
    setTimeout(() => this.focusSearch());
  }

  openNewItem(): void {
    this.newItemCode = '';
    this.newItemName = '';
    this.newItemCategory = 'Plumbing';
    this.newItemUnit = 'Pcs';
    this.newItemCost = 0;
    this.newItemPrice = 0;
    this.newItemStock = 0;
    this.newItemMinStock = 20;
    this.itemModalOpen.set(true);
  }

  saveNewItem(): void {
    const code = this.newItemCode.trim();
    if (!/^\d{3}$/.test(code) || !this.newItemName.trim() ||
        !Number.isFinite(Number(this.newItemCost)) || this.newItemCost < 0 ||
        !Number.isFinite(Number(this.newItemPrice)) || this.newItemPrice <= 0 ||
        !Number.isFinite(Number(this.newItemStock)) || this.newItemStock < 0 ||
        !Number.isFinite(Number(this.newItemMinStock)) || this.newItemMinStock < 0) {
      this.notify('Enter a unique 3-digit code, name, valid prices, stock, and non-negative minimum stock level.');
      return;
    }
    try {
      this.inventory.addItem({
        code,
        name: this.newItemName.trim(),
        category: this.newItemCategory,
        unit: this.newItemUnit,
        purchase_price: Number(this.newItemCost),
        selling_price: Number(this.newItemPrice),
        stock_qty: Number(this.newItemStock),
        min_stock_level: Number(this.newItemMinStock)
      });
      this.itemModalOpen.set(false);
      this.notify(`${this.newItemName.trim()} added to inventory.`);
    } catch (error) {
      this.notify(this.errorMessage(error));
    }
  }

  purchaseLineTotal(line: PurchaseLine): number {
    return line.quantity * line.purchaseCost;
  }

  purchaseInvoiceTotal(): number {
    return this.purchaseLines().reduce((total, line) => total + this.purchaseLineTotal(line), 0);
  }

  updatePurchaseLine(index: number, field: 'quantity' | 'purchaseCost' | 'sellingPrice', value: number): void {
    const line = this.purchaseLines()[index];
    if (!line) {
      return;
    }
    const parsedValue = Number(value);
    if (!Number.isFinite(parsedValue)) {
      return;
    }
    this.purchaseLines.update(lines => lines.map((current, lineIndex) => {
      if (lineIndex !== index) {
        return current;
      }
      if (field === 'quantity') {
        return { ...current, quantity: parsedValue > 0 ? parsedValue : 1 };
      }
      if (field === 'purchaseCost') {
        return { ...current, purchaseCost: Math.max(0, parsedValue) };
      }
      return { ...current, sellingPrice: Math.max(0, parsedValue) };
    }));
  }

  stagePurchaseItem(): void {
    const text = this.purchaseCode().trim();
    const item = this.inventory.findByCode(text) ??
      this.inventory.items().find(candidate => candidate.name.toLowerCase() === text.toLowerCase());
    if (!item) {
      this.notify('Choose an existing item by its code or name.');
      return;
    }
    const quantity = Number(this.purchaseQuantity());
    const purchaseCost = Number(this.purchaseUnitCost());
    const sellingPrice = Number(this.purchaseSellingPrice());
    if (!Number.isFinite(quantity) || quantity <= 0 ||
        !Number.isFinite(purchaseCost) || purchaseCost < 0 ||
        !Number.isFinite(sellingPrice) || sellingPrice < 0) {
      this.notify('Purchase quantity must be positive, purchase cost cannot be negative, and selling price cannot be negative.');
      return;
    }
    this.purchaseLines.update(lines => [...lines, {
      item,
      quantity,
      purchaseCost,
      sellingPrice
    }]);
    this.purchaseCode.set('');
    this.purchaseQuantity.set(1);
    this.purchaseUnitCost.set(item.purchase_price);
    this.purchaseSellingPrice.set(item.selling_price);
  }

  selectPurchaseItem(item: Item): void {
    this.purchaseCode.set(item.code);
    this.purchaseUnitCost.set(item.purchase_price);
    this.purchaseSellingPrice.set(item.selling_price);
  }

  savePurchase(): void {
    const vendor = this.selectedVendorId !== null ? this.vendorService.findById(this.selectedVendorId) : undefined;
    if (!vendor || !this.vendorInvoice.trim() || !this.purchaseLines().length) {
      this.notify('Enter vendor details and add at least one purchase item.');
      return;
    }
    try {
      this.purchaseLines().forEach(line => {
        this.inventory.adjustStock(line.item.id, line.quantity);
        this.inventory.updateItem(line.item.id, {
          ...line.item,
          purchase_price: Number(line.purchaseCost),
          selling_price: Number(line.sellingPrice),
          stock_qty: line.item.stock_qty + line.quantity
        });
      });
      this.purchaseHistory.update(history => [{
        invoiceNo: this.vendorInvoice.trim(),
        vendorId: vendor.id,
        vendorName: vendor.name,
        vendorCompany: vendor.company_name,
        date: this.purchaseDate
      }, ...history]);
      this.purchaseLines.set([]);
      this.purchaseCode.set('');
      this.purchaseQuantity.set(1);
      this.purchaseUnitCost.set(0);
      this.purchaseSellingPrice.set(0);
      this.vendorName = '';
      this.vendorInvoice = '';
      this.selectedVendorId = null;
      this.notify('Purchase saved and item prices updated.');
    } catch (error) {
      this.notify(this.errorMessage(error));
    }
  }

  findReturnInvoice(): void {
    const receipt = this.savedReceipts().find(item => item.invoiceNo.toLowerCase() === this.returnInvoiceQuery().trim().toLowerCase());
    if (!receipt) {
      this.selectedReturnReceipt.set(null);
      this.returnLines.set([]);
      this.notify('Invoice not found in this session.');
      return;
    }
    this.selectedReturnReceipt.set(receipt);
    this.returnLines.set(receipt.lines.map(line => ({
      original: line,
      quantity: 0,
      refundUnitPrice: line.item.selling_price,
      reason: 'Damaged',
      restock: true
    })));
    this.alert.set('');
  }

  updateReturnLine(index: number, field: 'quantity' | 'refundUnitPrice' | 'reason' | 'restock', value: number | string | boolean): void {
    this.returnLines.update(lines => lines.map((line, lineIndex) => {
      if (lineIndex !== index) {
        return line;
      }
      if (field === 'quantity') {
        return { ...line, quantity: Number(value) };
      }
      if (field === 'refundUnitPrice') {
        return { ...line, refundUnitPrice: Math.max(0, Number(value) || 0) };
      }
      if (field === 'reason') {
        return { ...line, reason: value as ReturnLine['reason'] };
      }
      return { ...line, restock: Boolean(value) };
    }));
  }

  processReturn(): void {
    const selected = this.returnLines().filter(line => line.quantity > 0);
    if (!selected.length) {
      this.notify('Enter a return quantity for at least one item.');
      return;
    }
    const invoiceNo = this.selectedReturnReceipt()?.invoiceNo ?? '';
    const invalid = selected.find(line =>
      line.quantity > line.original.quantity - (this.returnedQuantities()[`${invoiceNo}:${line.original.item.id}`] ?? 0) ||
      line.quantity < 0 || !Number.isFinite(line.refundUnitPrice)
    );
    if (invalid) {
      this.notify(`Return quantity for ${invalid.original.item.name} exceeds the remaining sold quantity.`);
      return;
    }
    try {
      selected.filter(line => line.restock).forEach(line =>
        this.inventory.adjustStock(line.original.item.id, line.quantity)
      );
      const amount = selected.reduce((sum, line) => sum + line.quantity * line.refundUnitPrice, 0);
      this.returnedQuantities.update(quantities => {
        const updated = { ...quantities };
        selected.forEach(line => {
          const key = `${invoiceNo}:${line.original.item.id}`;
          updated[key] = (updated[key] ?? 0) + line.quantity;
        });
        return updated;
      });
      const details = selected.map(line => `${line.quantity}× ${line.original.item.name} (${line.reason})`).join(', ');
      this.returnHistory.update(history => [`${invoiceNo} · ${this.refundMode()} · ₹${amount.toFixed(2)} · ${details}`, ...history]);
      this.selectedReturnReceipt.set(null);
      this.returnLines.set([]);
      this.returnInvoiceQuery.set('');
      this.notify(`Return recorded for ₹${amount.toFixed(2)} (${this.refundMode()}).`);
    } catch (error) {
      this.notify(this.errorMessage(error));
    }
  }

  printReceipt(): void {
    window.print();
  }

  closeReceipt(): void {
    this.receipt.set(null);
    setTimeout(() => this.focusSearch());
  }

  lineTotal(line: CartLine): number {
    return Math.max(0, line.quantity * line.item.selling_price - line.discount);
  }

  remainingReturnQuantity(line: ReturnLine): number {
    const invoiceNo = this.selectedReturnReceipt()?.invoiceNo ?? '';
    return Math.max(0, line.original.quantity -
      (this.returnedQuantities()[`${invoiceNo}:${line.original.item.id}`] ?? 0));
  }

  private focusSearch(): void {
    if (this.activeView() === 'billing') {
      document.getElementById('itemSearch')?.focus();
    }
  }

  private viewFromPath(path: string): ViewName | null {
    const route = path.replace(/\/+$/, '') || '/';
    if (route === '/') return 'billing';
    if (route === '/inventory' || route === '/purchases' || route === '/returns' || route === '/invoices' || route === '/customers' || route === '/vendors' || route === '/settings') {
      return route.slice(1) as ViewName;
    }
    return null;
  }

  notify(message: string): void {
    this.alert.set(message);
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'The operation could not be completed.';
  }
}
