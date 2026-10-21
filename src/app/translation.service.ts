import { Injectable, Pipe, PipeTransform, signal } from '@angular/core';

export type Language = 'en' | 'ml';

const malayalam: Record<string, string> = {
  'Switch language': 'ഭാഷ മാറ്റുക',
  'Theme': 'തീം',
  'lines': 'നിരകൾ',
  'Switch to light theme': 'ലൈറ്റ് തീമിലേക്ക് മാറ്റുക',
  'Switch to dark theme': 'ഡാർക്ക് തീമിലേക്ക് മാറ്റുക',
  'Toggle dark/light theme': 'ഡാർക്ക്/ലൈറ്റ് തീം മാറ്റുക',
  'Search': 'തിരയുക',
  'Discount': 'ഇളവ്',
  'Cash': 'പണം',
  'Credit': 'ക്രെഡിറ്റ്',
  'Reset': 'പുനഃക്രമീകരിക്കുക',
  'Switch language (EN / ML)': 'ഭാഷ മാറ്റുക (EN / ML)',
  'Toggle dark / light theme': 'ഡാർക്ക് / ലൈറ്റ് തീം മാറ്റുക',
  'WORKSPACE': 'പ്രവർത്തനമേഖല',
  'Billing': 'ബില്ലിംഗ്',
  'MANAGEMENT': 'നിർവഹണം',
  'Inventory': 'ശേഖരം',
  'Stock In': 'സ്റ്റോക്ക് വരവ്',
  'Sales Returns': 'വിൽപ്പന മടക്കങ്ങൾ',
  'CUSTOMER MANAGEMENT': 'ഉപഭോക്തൃ മാനേജ്മെന്റ്',
  'Customers': 'ഉപഭോക്താക്കൾ',
  'Manage customer contact details and outstanding credit.': 'ഉപഭോക്തൃ ബന്ധപ്പെടൽ വിവരങ്ങളും കുടിശ്ശികയും നിയന്ത്രിക്കുക.',
  'Add customer': 'ഉപഭോക്താവിനെ ചേർക്കുക',
  'customers': 'ഉപഭോക്താക്കൾ',
  'Search by customer name or phone': 'ഉപഭോക്താവിന്റെ പേരോ ഫോണോ ഉപയോഗിച്ച് തിരയുക',
  'VENDOR MANAGEMENT': 'വെണ്ടർ മാനേജ്മെന്റ്',
  'Vendors': 'വെണ്ടർമാർ',
  'Vendor management': 'വെണ്ടർ മാനേജ്മെന്റ്',
  'Manage supplier contact details and delivery records.': 'വിതരണക്കാരന്റെ ബന്ധപ്പെടൽ വിവരങ്ങളും ഡെലിവറി രേഖകളും നിയന്ത്രിക്കുക.',
  'Add vendor': 'വെണ്ടർ ചേർക്കുക',
  'vendors': 'വെണ്ടർമാർ',
  'Search by vendor name or phone': 'വെണ്ടർ പേരോ ഫോണോ ഉപയോഗിച്ച് തിരയുക',
  'Search vendors': 'വെണ്ടർമാരെ തിരയുക',
  'Company': 'കമ്പനി',
  'Company name': 'കമ്പനിയുടെ പേര്',
  'Contact person': 'ബന്ധപ്പെടുന്ന വ്യക്തി',
  'Email': 'ഇമെയിൽ',
  'No vendors found.': 'വെണ്ടർമാരെ കണ്ടെത്തിയില്ല.',
  'Edit vendor': 'വെണ്ടർ തിരുത്തുക',
  'Save vendor': 'വെണ്ടർ സംരക്ഷിക്കുക',
  'Search customers': 'ഉപഭോക്താക്കളെ തിരയുക',
  'Address': 'വിലാസം',
  'GSTIN': 'GSTIN',
  'Credit outstanding': 'ക്രെഡിറ്റ് കുടിശ്ശിക',
  'Created': 'സൃഷ്ടിച്ചത്',
  'No customers found.': 'ഉപഭോക്താക്കളെ കണ്ടെത്തിയില്ല.',
  'Edit customer': 'ഉപഭോക്താവിനെ തിരുത്തുക',
  'Save customer': 'ഉപഭോക്താവിനെ സംരക്ഷിക്കുക',
  'Full name or phone': 'പൂർണ്ണ പേര് അല്ലെങ്കിൽ ഫോൺ',
  'Due': 'കുടിശ്ശിക',
  'Customer selected': 'ഉപഭോക്താവിനെ തിരഞ്ഞെടുത്തു',
  'Customer is optional for cash sales': 'പണ വിൽപ്പനയ്ക്ക് ഉപഭോക്തൃ വിവരങ്ങൾ ഐച്ഛികമാണ്',
  '＋ Quick add customer': '＋ ഉപഭോക്താവിനെ വേഗത്തിൽ ചേർക്കുക',
  'Customer added successfully.': 'ഉപഭോക്താവിനെ വിജയകരമായി ചേർത്തു.',
  'A customer with phone': 'ഈ ഫോണുള്ള ഉപഭോക്താവ്',
  'Enter a customer name and a valid 7–15 digit phone number.': 'ഉപഭോക്താവിന്റെ പേരും സാധുവായ 7–15 അക്ക ഫോൺ നമ്പറും നൽകുക.',
  'SALES LEDGER': 'വിൽപ്പന ലെഡ്ജർ',
  'Invoice history': 'ഇൻവോയ്സ് ചരിത്രം',
  'Review completed sales and print invoices.': 'പൂർത്തിയായ വിൽപ്പന പരിശോധിച്ച് ഇൻവോയ്സുകൾ അച്ചടിക്കുക.',
  'Total sales count': 'ആകെ വിൽപ്പന എണ്ണം',
  'Total cash collected': 'ആകെ പണം ലഭിച്ചത്',
  'Total credit outstanding': 'ആകെ കുടിശ്ശിക ക്രെഡിറ്റ്',
  'Today': 'ഇന്ന്',
  'invoices': 'ഇൻവോയ്സുകൾ',
  'Search invoice, customer, or phone': 'ഇൻവോയ്സ്, ഉപഭോക്താവ്, അല്ലെങ്കിൽ ഫോൺ തിരയുക',
  'Search invoices': 'ഇൻവോയ്സുകൾ തിരയുക',
  'ALL': 'എല്ലാം',
  'CASH': 'പണം',
  'CREDIT': 'ക്രെഡിറ്റ്',
  'Invoice No': 'ഇൻവോയ്സ് നമ്പർ',
  'Date & Time': 'തീയതിയും സമയവും',
  'Customer Name & Phone': 'ഉപഭോക്താവിന്റെ പേരും ഫോണും',
  'Total Items': 'ആകെ ഉൽപ്പന്നങ്ങൾ',
  'Grand Total': 'ആകെ തുക',
  'Payment Type': 'പേയ്മെന്റ് രീതി',
  'Cashier Name': 'കാഷ്യറുടെ പേര്',
  'No invoices match your search.': 'തിരയലിന് അനുയോജ്യമായ ഇൻവോയ്സുകളില്ല.',
  'INVOICE DETAILS': 'ഇൻവോയ്സ് വിശദാംശങ്ങൾ',
  'CUSTOMER': 'ഉപഭോക്താവ്',
  'CASHIER': 'കാഷ്യർ',
  'ITEM DISCOUNT': 'ഉൽപ്പന്ന ഇളവ്',
  'Print Thermal Receipt': 'തെർമൽ രസീത് അച്ചടിക്കുക',
  'Close': 'അടയ്ക്കുക',
  'EDIT INVOICE': 'ഇൻവോയ്സ് തിരുത്തുക',
  'Adjust items and save to update this invoice.': 'ഇൻവോയ്സ് പുതുക്കാൻ ഉൽപ്പന്നങ്ങൾ മാറ്റി സംരക്ഷിക്കുക.',
  'Cancel edit': 'തിരുത്തൽ റദ്ദാക്കുക',
  'Edit Invoice': 'ഇൻവോയ്സ് തിരുത്തുക',
  'Edited': 'തിരുത്തിയത്',
  'LAST EDITED': 'അവസാനം തിരുത്തിയത്',
  'Update cash invoice': 'പണ ഇൻവോയ്സ് പുതുക്കുക',
  'Update credit invoice': 'ക്രെഡിറ്റ് ഇൻവോയ്സ് പുതുക്കുക',
  'F5 focuses cart; use arrow keys to move rows': 'കാർട്ടിലേക്ക് പോകാൻ F5, വരികൾക്കായി അമ്പടയാള കീകൾ',
  'Quantity for': 'അളവ്',
  'Discount for': 'ഇളവ്',
  'An item in this invoice no longer exists in inventory.': 'ഈ ഇൻവോയ്സിലെ ഒരു ഉൽപ്പന്നം ശേഖരത്തിലില്ല.',
  'Invoice updated successfully.': 'ഇൻവോയ്സ് വിജയകരമായി പുതുക്കി.',
  'Offline mode': 'ഓഫ്‌ലൈൻ മോഡ്',
  'Data stays in this session': 'ഡാറ്റ ഈ സെഷനിൽ തുടരും',
  'POINT OF SALE': 'വിൽപ്പന കേന്ദ്രം',
  'Billing counter': 'ബില്ലിംഗ് കൗണ്ടർ',
  'Scan or search an item to start a new sale.': 'പുതിയ വിൽപ്പന ആരംഭിക്കാൻ ഉൽപ്പന്നം സ്കാൻ ചെയ്യുക അല്ലെങ്കിൽ തിരയുക.',
  'Add items': 'ഉൽപ്പന്നങ്ങൾ ചേർക്കുക',
  'Code or product name': 'കോഡ് അല്ലെങ്കിൽ ഉൽപ്പന്നത്തിന്റെ പേര്',
  'ITEM CODE / NAME': 'ഉൽപ്പന്ന കോഡ് / പേര്',
  'Try “101” or “PVC pipe”': '“101” അല്ലെങ്കിൽ “PVC pipe” പരീക്ഷിക്കുക',
  'QTY': 'എണ്ണം',
  'LINE DISC. ₹': 'ലൈൻ ഇളവ് ₹',
  'Add': 'ചേർക്കുക',
  'Add to cart': 'കാർട്ടിലേക്ക് ചേർക്കുക',
  'Select item': 'ഉൽപ്പന്നം തിരഞ്ഞെടുക്കുക',
  'select': 'തിരഞ്ഞെടുക്കുക',
  'Current sale': 'നിലവിലെ വിൽപ്പന',
  'Clear sale': 'വിൽപ്പന മായ്ക്കുക',
  'ITEM': 'ഉൽപ്പന്നം',
  'UNIT PRICE': 'യൂണിറ്റ് വില',
  'DISC.': 'ഇളവ്',
  'TOTAL': 'ആകെ',
  'Your sale is empty': 'വിൽപ്പനയിൽ ഉൽപ്പന്നങ്ങളില്ല',
  'Search by item code or name to add products.': 'ഉൽപ്പന്നങ്ങൾ ചേർക്കാൻ കോഡ് അല്ലെങ്കിൽ പേര് ഉപയോഗിച്ച് തിരയുക.',
  'Payment': 'പേയ്മെന്റ്',
  'READY': 'തയ്യാർ',
  'Customer name': 'ഉപഭോക്താവിന്റെ പേര്',
  'Phone number': 'ഫോൺ നമ്പർ',
  'Full name': 'പൂർണ്ണ പേര്',
  'Subtotal': 'ഉപമൊത്തം',
  'Bill discount': 'ബിൽ ഇളവ്',
  'NET PAYABLE': 'അടയ്ക്കേണ്ട തുക',
  'Inclusive of all discounts': 'എല്ലാ ഇളവുകളും ഉൾപ്പെടെ',
  'Cash sale': 'പണ വിൽപ്പന',
  'Credit sale': 'ക്രെഡിറ്റ് വിൽപ്പന',
  'Search code or name': 'കോഡ് അല്ലെങ്കിൽ പേര് തിരയുക',
  'No products match your search.': 'തിരയലിന് അനുയോജ്യമായ ഉൽപ്പന്നങ്ങളില്ല.',
  'Stock in': 'സ്റ്റോക്ക് വരവ്',
  'Purchase details': 'വാങ്ങൽ വിവരങ്ങൾ',
  'Received items': 'ലഭിച്ച ഉൽപ്പന്നങ്ങൾ',
  'Quantity': 'എണ്ണം',
  'Unit cost ₹': 'യൂണിറ്റ് ചെലവ് ₹',
  'Save purchase': 'വാങ്ങൽ സംരക്ഷിക്കുക',
  'Recent purchases': 'സമീപകാല വാങ്ങലുകൾ',
  'Find an invoice': 'ഇൻവോയ്സ് കണ്ടെത്തുക',
  'Look up invoice': 'ഇൻവോയ്സ് തിരയുക',
  'Record return': 'മടക്കം രേഖപ്പെടുത്തുക',
  'Add new item': 'പുതിയ ഉൽപ്പന്നം ചേർക്കുക',
  'Cancel': 'റദ്ദാക്കുക',
  'Add item': 'ഉൽപ്പന്നം ചേർക്കുക',
  'SALE COMPLETE': 'വിൽപ്പന പൂർത്തിയായി',
  'Print receipt': 'രസീത് അച്ചടിക്കുക',
  'Thank you for your business!': 'നിങ്ങളുടെ വ്യാപാരത്തിന് നന്ദി!',
  'Done': 'പൂർത്തിയായി',
  'CATALOGUE': 'ഉൽപ്പന്ന പട്ടിക',
  'Manage products, prices, and on-hand stock.': 'ഉൽപ്പന്നങ്ങൾ, വിലകൾ, നിലവിലുള്ള സ്റ്റോക്ക് എന്നിവ നിയന്ത്രിക്കുക.',
  '＋ Add new item': '＋ പുതിയ ഉൽപ്പന്നം ചേർക്കുക',
  'products': 'ഉൽപ്പന്നങ്ങൾ',
  ' · Stock on hand': ' · നിലവിലെ സ്റ്റോക്ക്',
  'CODE': 'കോഡ്',
  'PRODUCT': 'ഉൽപ്പന്നം',
  'CATEGORY': 'വിഭാഗം',
  'UNIT': 'യൂണിറ്റ്',
  'COST PRICE': 'വാങ്ങിയ വില',
  'SELLING PRICE': 'വിൽപ്പന വില',
  'IN STOCK': 'സ്റ്റോക്കിൽ',
  'MIN STOCK': 'കുറഞ്ഞ സ്റ്റോക്ക്',
  'Minimum stock level': 'കുറഞ്ഞ സ്റ്റോക്ക് നില',
  'In Stock:': 'സ്റ്റോക്കിലുള്ളത്:',
  'Out of Stock': 'സ്റ്റോക്ക് തീർന്നു',
  'Low stock': 'കുറഞ്ഞ സ്റ്റോക്ക്',
  'Out of Stock! Available: 0': 'സ്റ്റോക്ക് തീർന്നു! ലഭ്യമായത്: 0',
  'INVENTORY MOVEMENT': 'സ്റ്റോക്ക് നീക്കം',
  'Record a vendor delivery and update available quantities.': 'വിതരണക്കാരന്റെ ഡെലിവറി രേഖപ്പെടുത്തി ലഭ്യമായ അളവ് പുതുക്കുക.',
  'LOCAL SESSION': 'പ്രാദേശിക സെഷൻ',
  'Vendor name': 'വിതരണക്കാരന്റെ പേര്',
  'Vendor or supplier': 'വിതരണക്കാരൻ',
  'Vendor invoice no.': 'വിതരണക്കാരന്റെ ഇൻവോയ്സ് നമ്പർ',
  'Purchase date': 'വാങ്ങിയ തീയതി',
  'Item code or name': 'ഉൽപ്പന്ന കോഡ് അല്ലെങ്കിൽ പേര്',
  'e.g. 101 or PVC pipe': 'ഉദാ. 101 അല്ലെങ്കിൽ PVC pipe',
  '＋ Add line': '＋ വരി ചേർക്കുക',
  'UNIT COST': 'യൂണിറ്റ് ചെലവ്',
  'LINE TOTAL': 'വരി ആകെ',
  'No items added to this delivery yet.': 'ഈ ഡെലിവറിയിലേക്ക് ഉൽപ്പന്നങ്ങളൊന്നും ചേർത്തിട്ടില്ല.',
  'Stock is updated when you save.': 'സംരക്ഷിക്കുമ്പോൾ സ്റ്റോക്ക് പുതുക്കും.',
  'Saved': 'സംരക്ഷിച്ചു',
  'Purchase records created in this session will appear here.': 'ഈ സെഷനിൽ സൃഷ്ടിച്ച വാങ്ങൽ രേഖകൾ ഇവിടെ കാണിക്കും.',
  'AFTER-SALES': 'വിൽപ്പനാനന്തരം',
  'Sales returns': 'വിൽപ്പന മടക്കങ്ങൾ',
  'Find a session invoice and record returned items.': 'സെഷൻ ഇൻവോയ്സ് കണ്ടെത്തി മടക്കിയ ഉൽപ്പന്നങ്ങൾ രേഖപ്പെടുത്തുക.',
  'SESSION INVOICES': 'സെഷൻ ഇൻവോയ്സുകൾ',
  'Invoice number': 'ഇൻവോയ്സ് നമ്പർ',
  'e.g. INV-1234567': 'ഉദാ. INV-1234567',
  'INVOICE': 'ഇൻവോയ്സ്',
  'DATE': 'തീയതി',
  'ORIGINAL TOTAL': 'യഥാർത്ഥ ആകെ',
  'SOLD QTY': 'വിറ്റ അളവ്',
  'RETURN QTY': 'മടക്ക അളവ്',
  'REFUND / UNIT': 'യൂണിറ്റിന് റീഫണ്ട്',
  'REASON': 'കാരണം',
  'RESTOCK': 'സ്റ്റോക്കിലേക്ക്',
  'Damaged': 'കേടായത്',
  'Excess': 'അധികം',
  'Refund mode': 'റീഫണ്ട് രീതി',
  'Cash Refund': 'പണം മടക്കുക',
  'Credit Balance': 'ക്രെഡിറ്റ് ബാലൻസ്',
  'Invoice lookup searches sales made during this session. Complete a sale first to try a return.': 'ഈ സെഷനിലെ വിൽപ്പനകളിൽ ഇൻവോയ്സ് തിരയുന്നു. മടക്കം പരീക്ഷിക്കാൻ ആദ്യം വിൽപ്പന പൂർത്തിയാക്കുക.',
  'Recent returns': 'സമീപകാല മടക്കങ്ങൾ',
  '3-digit code': '3 അക്ക കോഡ്',
  'Item name': 'ഉൽപ്പന്നത്തിന്റെ പേര്',
  'Cost price ₹': 'വാങ്ങിയ വില ₹',
  'Selling price ₹': 'വിൽപ്പന വില ₹',
  'Current stock': 'നിലവിലെ സ്റ്റോക്ക്',
  'Edit': 'തിരുത്തുക',
  'Update item': 'ഉൽപ്പന്നം പുതുക്കുക',
  'Save changes': 'മാറ്റങ്ങൾ സംരക്ഷിക്കുക',
  'updated.': 'പുതുക്കി.',
  'Enter quantity and press Enter to add': 'അളവ് നൽകി ചേർക്കാൻ Enter അമർത്തുക',
  'Selected — set quantity, then press Enter or Add to cart': 'തിരഞ്ഞെടുത്തു — അളവ് നൽകി Enter അമർത്തുക അല്ലെങ്കിൽ കാർട്ടിലേക്ക് ചേർക്കുക',
  'select item': 'ഉൽപ്പന്നം തിരഞ്ഞെടുക്കുക',
  'Invoice:': 'ഇൻവോയ്സ്:',
  'Cashier:': 'കാഷ്യർ:',
  'Payment:': 'പേയ്മെന്റ്:',
  'Customer:': 'ഉപഭോക്താവ്:',
  'GRAND TOTAL': 'ആകെ തുക',
  'HARDWARE COUNTER': 'ഹാർഡ്‌വെയർ കൗണ്ടർ',
  'Retail hardware & supplies': 'ഹാർഡ്‌വെയർ ഉൽപ്പന്നങ്ങളും സാധനങ്ങളും',
  'Login did not match. Use the demo credentials below.': 'ലോഗിൻ വിവരങ്ങൾ ശരിയല്ല. താഴെയുള്ള ഡെമോ വിവരങ്ങൾ ഉപയോഗിക്കുക.',
  'Inventory, purchases, and returns are available to admins only.': 'ശേഖരം, വാങ്ങലുകൾ, മടക്കങ്ങൾ എന്നിവ അഡ്മിൻമാർക്ക് മാത്രം ലഭ്യമാണ്.',
  'Search for an item first.': 'ആദ്യം ഒരു ഉൽപ്പന്നം തിരയുക.',
  'Add at least one item before checkout.': 'പേയ്മെന്റിന് മുമ്പ് കുറഞ്ഞത് ഒരു ഉൽപ്പന്നമെങ്കിലും ചേർക്കുക.',
  'Credit sale requires a customer name and a valid 7–15 digit phone number.': 'ക്രെഡിറ്റ് വിൽപ്പനയ്ക്ക് ഉപഭോക്താവിന്റെ പേരും സാധുവായ 7–15 അക്ക ഫോൺ നമ്പറും വേണം.',
  'Enter a unique 3-digit code, name, non-negative cost and stock, and a selling price above zero.': 'തനതായ 3 അക്ക കോഡ്, പേര്, പൂജ്യത്തേക്കാൾ കുറയാത്ത ചെലവും സ്റ്റോക്കും, പൂജ്യത്തേക്കാൾ കൂടുതലായ വിൽപ്പന വിലയും നൽകുക.',
  'Choose an existing item by its code or name.': 'കോഡ് അല്ലെങ്കിൽ പേര് ഉപയോഗിച്ച് നിലവിലുള്ള ഉൽപ്പന്നം തിരഞ്ഞെടുക്കുക.',
  'Purchase quantity must be positive and unit cost cannot be negative.': 'വാങ്ങൽ അളവ് പൂജ്യത്തേക്കാൾ കൂടുതലും യൂണിറ്റ് ചെലവ് നെഗറ്റീവ് അല്ലാതെയും വേണം.',
  'Enter vendor details and add at least one purchase item.': 'വിതരണക്കാരന്റെ വിവരങ്ങൾ നൽകി കുറഞ്ഞത് ഒരു വാങ്ങൽ ഉൽപ്പന്നമെങ്കിലും ചേർക്കുക.',
  'Purchase saved and stock updated.': 'വാങ്ങൽ സംരക്ഷിച്ചു, സ്റ്റോക്ക് പുതുക്കി.',
  'Invoice not found in this session.': 'ഈ സെഷനിൽ ഇൻവോയ്സ് കണ്ടെത്താനായില്ല.',
  'Enter a return quantity for at least one item.': 'കുറഞ്ഞത് ഒരു ഉൽപ്പന്നത്തിന്റെയെങ്കിലും മടക്ക അളവ് നൽകുക.',
  'The operation could not be completed.': 'പ്രവർത്തനം പൂർത്തിയാക്കാനായില്ല.',
  'Welcome back': 'തിരികെ സ്വാഗതം',
  'Sign in to open your point-of-sale workspace.': 'വിൽപ്പന കേന്ദ്രം തുറക്കാൻ സൈൻ ഇൻ ചെയ്യുക.',
  'Username': 'ഉപയോക്തൃനാമം',
  'Password': 'പാസ്‌വേഡ്',
  '4-digit cashier PIN': '4 അക്ക കാഷ്യർ പിൻ',
  'Cashier only': 'കാഷ്യർ മാത്രം',
  'Sign in': 'സൈൻ ഇൻ',
  'Demo access': 'ഡെമോ പ്രവേശനം',
  'Admin:': 'അഡ്മിൻ:',
  'Keyboard shortcuts': 'കീബോർഡ് കുറുക്കുവഴികൾ',
  'Lock session': 'സെഷൻ ലോക്ക് ചെയ്യുക',
  'Dismiss message': 'സന്ദേശം അടയ്ക്കുക',
  'Search item code or name': 'ഉൽപ്പന്ന കോഡ് അല്ലെങ്കിൽ പേര് തിരയുക',
  'Line discount in rupees': 'രൂപയിലെ ലൈൻ ഇളവ്',
  'Overall bill discount in rupees': 'രൂപയിലെ മൊത്തം ബിൽ ഇളവ്',
  'Discount is applied up to the subtotal.': 'ഇളവ് ഉപമൊത്തം തുക വരെ മാത്രമേ ബാധകമാകൂ.',
  '3-digit code adds instantly': '3 അക്ക കോഡ് നൽകിയാൽ ഉടൻ ചേർക്കും',
  'in stock': 'സ്റ്റോക്കിൽ',
  'Actions': 'പ്രവർത്തനങ്ങൾ',
  'total items': 'ആകെ ഉൽപ്പന്നങ്ങൾ',
  'Focus row and press': 'വരി തിരഞ്ഞെടുത്ത് അമർത്തുക',
  'to remove': 'നീക്കം ചെയ്യാൻ',
  'Inventory updates after checkout': 'പേയ്മെന്റിന് ശേഷം സ്റ്റോക്ക് പുതുക്കും',
  'Payment type': 'പേയ്മെന്റ് രീതി',
  '7–15 digits': '7–15 അക്കങ്ങൾ',
  'A receipt preview opens after payment. Press Esc to clear the active sale.': 'പേയ്മെന്റിന് ശേഷം രസീത് പ്രിവ്യൂ തുറക്കും. നിലവിലെ വിൽപ്പന മായ്ക്കാൻ Esc അമർത്തുക.',
  'e.g. PO-00482': 'ഉദാ. PO-00482',
  'item': 'ഉൽപ്പന്നം',
  'items': 'ഉൽപ്പന്നങ്ങൾ',
  'Focus row and press Delete to remove': 'നീക്കം ചെയ്യാൻ വരി തിരഞ്ഞെടുത്ത് Delete അമർത്തുക'
};

const dictionaries: Record<Language, Record<string, string>> = {
  en: Object.fromEntries(Object.keys(malayalam).map(key => [key, key])),
  ml: malayalam
};

@Injectable({ providedIn: 'root' })
export class TranslationService {
  readonly currentLang = signal<Language>(this.readLanguage());

  constructor() {
    document.documentElement.lang = this.currentLang();
  }

  toggleLanguage(): void {
    this.setLanguage(this.currentLang() === 'en' ? 'ml' : 'en');
  }

  setLanguage(language: Language): void {
    this.currentLang.set(language);
    localStorage.setItem('hardware-counter-language', language);
    document.documentElement.lang = language;
  }

  translate(key: string): string {
    const language = this.currentLang();
    const dictionary = dictionaries[language];
    if (dictionary[key]) {
      return dictionary[key];
    }
    if (language === 'ml') {
      const stockMessage = /^Not enough stock for (.+)\. Available: (.+)\.$/.exec(key);
      if (stockMessage) {
        return `${stockMessage[1]} ന് മതിയായ സ്റ്റോക്കില്ല. ലഭ്യമായത്: ${stockMessage[2]}.`;
      }
      const newItemMessage = /^(.+) added to inventory\.$/.exec(key);
      if (newItemMessage) {
        return `${newItemMessage[1]} ശേഖരത്തിലേക്ക് ചേർത്തു.`;
      }
      const updatedItemMessage = /^(.+) updated\.$/.exec(key);
      if (updatedItemMessage) {
        return `${updatedItemMessage[1]} പുതുക്കി.`;
      }
      const duplicateCustomerMessage = /^A customer with phone (.+) already exists\.$/.exec(key);
      if (duplicateCustomerMessage) {
        return `${duplicateCustomerMessage[1]} എന്ന ഫോൺ നമ്പറിൽ ഉപഭോക്താവ് നിലവിലുണ്ട്.`;
      }
      const returnMessage = /^Return recorded for ₹(.+) \((.+)\)\.$/.exec(key);
      if (returnMessage) {
        return `₹${returnMessage[1]}-ന്റെ മടക്കം രേഖപ്പെടുത്തി (${returnMessage[2]}).`;
      }
      const invalidReturnMessage = /^Return quantity for (.+) exceeds the remaining sold quantity\.$/.exec(key);
      if (invalidReturnMessage) {
        return `${invalidReturnMessage[1]}-ന്റെ മടക്ക അളവ് ശേഷിക്കുന്ന വിറ്റ അളവിനെ കവിയുന്നു.`;
      }
      const outOfStockMessage = /^Out of Stock! Available: 0 (.+)\.$/.exec(key);
      if (outOfStockMessage) {
        return `സ്റ്റോക്ക് തീർന്നു! ലഭ്യമായത്: 0 ${outOfStockMessage[1]}.`;
      }
      const noAdditionalStockMessage = /^Insufficient stock! No additional (.+) available\.$/.exec(key);
      if (noAdditionalStockMessage) {
        return `മതിയായ സ്റ്റോക്കില്ല! അധികം ${noAdditionalStockMessage[1]} ലഭ്യമല്ല.`;
      }
      const cappedStockMessage = /^Insufficient stock! Only (.+) (.+) available\. Quantity capped; press Enter to confirm\.$/.exec(key);
      if (cappedStockMessage) {
        return `മതിയായ സ്റ്റോക്കില്ല! ${cappedStockMessage[1]} ${cappedStockMessage[2]} മാത്രമേ ലഭ്യമുള്ളൂ. അളവ് പരിധിയാക്കി; സ്ഥിരീകരിക്കാൻ Enter അമർത്തുക.`;
      }
      const maximumStockMessage = /^Insufficient stock! Maximum quantity is (.+) (.+)\.$/.exec(key);
      if (maximumStockMessage) {
        return `മതിയായ സ്റ്റോക്കില്ല! പരമാവധി അളവ് ${maximumStockMessage[1]} ${maximumStockMessage[2]} ആണ്.`;
      }
      const removeItemMessage = /^Remove (.+)$/.exec(key);
      if (removeItemMessage) {
        return `${removeItemMessage[1]} നീക്കം ചെയ്യുക`;
      }
      const returnQuantityLabel = /^Return quantity for (.+)$/.exec(key);
      if (returnQuantityLabel) {
        return `${returnQuantityLabel[1]}-ന്റെ മടക്ക അളവ്`;
      }
      const refundPriceLabel = /^Refund unit price for (.+)$/.exec(key);
      if (refundPriceLabel) {
        return `${refundPriceLabel[1]}-ന്റെ യൂണിറ്റ് റീഫണ്ട് വില`;
      }
      const reasonLabel = /^Reason for (.+)$/.exec(key);
      if (reasonLabel) {
        return `${reasonLabel[1]}-ന്റെ കാരണം`;
      }
      const restockLabel = /^Restock (.+)$/.exec(key);
      if (restockLabel) {
        return `${restockLabel[1]} സ്റ്റോക്കിലേക്ക് ചേർക്കുക`;
      }
    }
    return key;
  }

  private readLanguage(): Language {
    if (typeof localStorage === 'undefined') {
      return 'en';
    }
    const saved = localStorage.getItem('hardware-counter-language');
    return saved === 'ml' ? 'ml' : 'en';
  }
}

@Pipe({ name: 'translate', standalone: true, pure: false })
export class TranslationPipe implements PipeTransform {
  constructor(private readonly translations: TranslationService) {}

  transform(key: string): string {
    return this.translations.translate(key);
  }
}
