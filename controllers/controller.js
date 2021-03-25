var request = require('request')

async function api_request(url) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      request(url, (err, response, body) => {
        if (!err && response.statusCode < 400) {
          resolve(JSON.parse(body))
        }
      })
    }, 1500)
  })
}

const GameData = {
  fps: {},
}

const categories = {
  fps: ['730', '440', '578080', '218620', '444090', '272060', '1172470', '1229490', '552520', '1085660', '359550', '252490', '550', '230410'],
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
}

main()

exports.default = async (req, res) => {
  res.send(GameData)
}
