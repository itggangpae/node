console.log(this)
console.log(this == global)
console.log(this == module.exports)
console.log(this == exports)

var fun = () => {
    console.log(this == global)
    console.log(this == module.exports)
}
fun()