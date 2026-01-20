// Test gradient with 4 stops
const testGradient = 'linear-gradient(135deg, rgb(255, 107, 107) 0%, rgb(255, 200, 100) 33%, rgb(254, 202, 87) 66%, rgb(100, 200, 255) 100%)'

console.log('Testing 4-stop gradient parsing...')
const { cssToGradient } = require('./lib/utils/gradient-utils')
const result = cssToGradient(testGradient)
console.log('Result:', JSON.stringify(result, null, 2))
