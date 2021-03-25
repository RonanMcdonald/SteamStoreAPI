var request = require('request')

async function api_request(url) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      request(url, (err, response, body) => {
        if (!err && response.statusCode < 400) {
          resolve(JSON.parse(body))
        }
      })
    }, 1000)
  })
}

const GameData = {
  fps: {},
}

const categories = {
  fps: ['218620'],
}

async function main() {
  for (let i = 0; i < categories.fps.length; i++) {
    const url = 'https://steamspy.com/api.php?request=appdetails&appid=' + categories.fps[i]

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

    GameData.fps[i] = data
  }
  return GameData
}

main()

exports.default = async (req, res) => {
  await main().then((data) => {
    res.send(data)
  })
}
