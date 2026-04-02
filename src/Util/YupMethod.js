import * as Yup from 'yup'

Yup.addMethod(Yup.number, 'decimal', function (message) {
  return this.test('decimal', message || 'Value must be a valid decimal', (value) =>
    value ? /^\d{1,13}(\.\d{1,6})?$/.test(value) : true
  )
})
