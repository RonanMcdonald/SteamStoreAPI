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
  fantasy: {},
}

const categories = {
  fps: ['730', '440', '578080', '218620', '444090', '272060', '1172470', '1229490', '552520', '1085660', '359550', '252490', '550', '230410'],
  fantasy: ['306130', '594570', '444090', '1086940', '364360', '262060', '356190', '508440', '570', '292030', '582010', '582010', '435150', '489830'],

  // fps: ['730', '440'],
  // fantasy: ['306130', '594570'],
}

async function main() {
  const arr = Object.keys(categories)
  for (let x = 0; x < arr.length; x++) {
    for (let i = 0; i < 14; i++) {
      const url = 'https://steamspy.com/api.php?request=appdetails&appid=' + categories[arr[x]][i]
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

      GameData[arr[x]][i] = data
    }
  }
  console.log(GameData)
}

main()

exports.default = async (req, res) => {
  res.send(GameData)
}
