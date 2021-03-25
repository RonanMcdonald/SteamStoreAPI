var request = require('request')

const api_request = (url) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      request(url, (err, response, body) => {
        if (!err && response.statusCode < 400) {
          resolve(JSON.parse(body))
        }
      })
    }, 100)
  })
}

main()

const GameData = []

async function main() {
  const url = 'https://steamspy.com/api.php?request=appdetails&appid=218620'

  const obj = await api_request(url)

  const data = {
    app_id: obj.appid,
    name: obj.name,
    developer: obj.developer,
    publisher: obj.publisher,
    languages: obj.languages,
    score: {
      positive: obj.positive,
      negative: obj.negative,
    },
  }

  GameData.push(data)
  console.log(data)
}

exports.default = async (req, res) => {
  res.send(GameData)
}
