const obj = {
  name: 'green',
  apple: 'red',
}

exports.default = async (req, res) => {
  res.send(obj)
}
