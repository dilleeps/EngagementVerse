const MENUS = (companyInfo) => [
  {
    label: 'Setup',
    children: [
      {
        label: 'Company Masters',
        type: 'group',
        children: [
          {
            label: 'Companies',
            value: '/app/companies',
            access: [
              { label: 'Add', value: 'add-company' },
              { label: 'Edit', value: 'edit-company' }
            ],
            notInMenu: true
          },
          {
            label: 'Configurations',
            value: '/app/company-configurations',
            access: [{ label: 'Full', value: 'company-configurations' }]
          },
          {
            label: 'Roles',
            value: '/app/roles',
            access: [
              { label: 'View', value: 'roles' },
              { label: 'Add', value: 'add-role' },
              { label: 'Edit', value: 'edit-role' }
            ]
          },
          {
            label: 'Users',
            value: '/app/users',
            access: [
              { label: 'View', value: 'users' },
              { label: 'Add', value: 'add-user' },
              { label: 'Edit', value: 'edit-user' }
            ]
          },
          {
            label: 'Customers',
            value: '/app/customers',
            access: [
              { label: 'View', value: 'customers' },
              { label: 'Add', value: 'add-customer' },
              { label: 'Edit', value: 'edit-customer' }
            ]
          },
          {
            label: 'Options',
            value: '/app/options',
            access: [
              { label: 'View', value: 'options' },
              { label: 'Add', value: 'add-option' },
              { label: 'Edit', value: 'edit-option' }
            ]
          },
          {
            label: 'Products',
            value: '/app/products',
            access: [
              { label: 'View', value: 'products' },
              { label: 'Add', value: 'add-product' },
              { label: 'Edit', value: 'edit-product' }
            ]
          },

          {
            label: 'Numbering Series',
            value: '/app/numbering-series',
            access: [{ label: 'Full', value: 'numbering-series' }],
            dontShow: companyInfo?.configurations?.invoiceNumberingSeries !== 'Yes'
          },
          {
            label: 'Currencies',
            value: '/app/currencies',
            access: [
              { label: 'View', value: 'currencies' },
              { label: 'Add', value: 'add-currency' },
              { label: 'Edit', value: 'edit-currency' }
            ]
          },
          {
            label: 'Custom Templates',
            value: '/app/custom-templates',
            access: [
              { label: 'View', value: 'custom-templates' },
              { label: 'Add', value: 'add-custom-template' },
              { label: 'Edit', value: 'edit-custom-template' }
            ]
          },
          {
            label: 'Upload E-Invoices',
            value: '/app/upload-income-invoices',
            access: [{ label: 'View', value: 'upload-income-invoices' }]
          }
        ]
      }
    ]
  },
  {
    label: 'Devices',
    value: '/app/devices',
    access: [
      { label: 'View', value: 'devices' },
      { label: 'Add', value: 'add-device' },
      { label: 'Edit', value: 'edit-device' },
      { label: 'Offline', value: 'offline-device' },
      { label: 'Upload', value: 'upload-device' }
    ]
  },
  {
    label: 'E-Invoicing',
    value: '/app/incomes',
    access: [
      { label: 'View', value: 'incomes' },
      { label: 'Add', value: 'add-income' },
      { label: 'Edit', value: 'edit-income' }
    ]
  },

  {
    label: 'LHDN Logs',
    value: '/app/transmission-logs',
    access: [{ label: 'View', value: 'transmission-logs' }]
  },

  {
    label: 'Consolidated',
    children: [
      {
        label: 'Network Consolidated',
        type: 'group',
        children: [
          {
            label: 'Dashboard',
            value: '/app/network/dashboard',
            access: [{ label: 'View', value: 'network/dashboard' }]
          },
          {
            label: 'Invoices',
            value: '/app/network/invoices',
            access: [{ label: 'View', value: 'network/invoices' }]
          }
        ]
      }
    ]
  },
  {
    label: 'DMS',
    value: '/app/documents',
    access: [{ label: 'View', value: 'documents' }]
  },
  {
    label: 'Simulator',
    value: '/app/simulator',
    access: [{ label: 'View', value: 'simulator' }]
  }
]
export default MENUS
