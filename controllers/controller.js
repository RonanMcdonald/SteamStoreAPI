var request = require('request')
var fs = require('fs')
const { reset } = require('nodemon')
const { parse } = require('path')

async function api_request(url) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      request(url, (err, response, body) => {
        if (!err && response.statusCode < 400) {
          resolve(JSON.parse(body))
        }
      })
    }, 300)
  })
}

const categories = {
  'First Person Shooter ': ['730', '440', '578080', '218620', '444090', '272060', '1172470', '1229490', '552520', '1085660', '359550', '252490', '550', '230410'],
  'Fantasy ': ['306130', '594570', '444090', '1086940', '364360', '262060', '356190', '508440', '570', '292030', '582010', '582010', '435150', '489830'],
  'Horror ': ['381210', '550', '232090', '242760', '322330', '221100', '305620', '412020', '379720', '500', '883710', '493520', '299740', '438740'],
}

// const categories = {
//   'First Person Shooter': ['730', '440'],
//   'Fantasy ': ['306130'],
// }

async function generate_game_data() {
  const arr = Object.keys(categories)
  const GameData = {}

  console.log('\n--- Generating game data ---') //debug check max time to get response
  console.log('MAX TIME: %i s', ((300 * (arr.length * categories[arr[0]].length)) / 1000) % 60)

  for (var x = 0; x < arr.length; x++) {
    //debug: Game Category being checked
    console.log('\nCATEGORY:', arr[x])

    var tempArr = []
    var tempObj = {}

    for (var i = 0; i < categories[arr[x]].length; i++) {
      var spyObj = await api_request('https://steamspy.com/api.php?request=appdetails&appid=' + categories[arr[x]][i])
      var powObjInit = await api_request('https://store.steampowered.com/api/appdetails?appids=' + categories[arr[x]][i] + '&cc=gb&l=en&format=json')
      var powObj = powObjInit[Object.keys(powObjInit)]['data']

      //debug: Game ID that is called
      console.log('I: %s/%i ID: %s', i < 10 ? '0' + i : i, categories[arr[x]].length - 1, categories[arr[x]][i])

      const data = {
        app_id: spyObj.appid,
        name: spyObj.name,
        developer: spyObj.developer,
        publisher: spyObj.publisher,
        languages: spyObj.languages,
        website: powObj['website'],
        background: powObj['background'],
        header_image: powObj['header_image'],
        release_date: powObj['release_date']['date'],
        coming_soon: powObj['release_date']['coming_soon'],
        price: check_if_free(powObj),
        screenshots: get_images(powObj),
        requirements: get_requirements(powObj),
        support_info: get_support_info(powObj),
        movies: get_movies(powObj),
        description: get_description(powObj),
        tags: get_tags(spyObj),
        score: {
          total: spyObj.positive + spyObj.negative,
          positive: spyObj.positive,
          negative: spyObj.negative,
        },
      }
      // GameData[arr[x]][i] = data
      tempArr.push(data)
    }

    GameData[arr[x]] = tempArr
  }

  let file = JSON.stringify(GameData, null, 2)
  fs.writeFileSync('data/game_data.json', file)
}

// Check if game is free
function check_if_free(obj) {
  const newObj = {
    is_free: 'Paid',
    currency: null,
    initial: null,
    final: null,
    discount_percent: null,
  }

  if (obj['is_free'] == true) {
    newObj.is_free = 'Free'
  } else {
    newObj.currency = obj['price_overview'].currency
    newObj.initial = obj['price_overview'].initial
    newObj.final = obj['price_overview'].final
    newObj.final_formatted = obj['price_overview'].final_formatted
    newObj.discount_percent = obj['price_overview'].discount_percent
  }
  return newObj
}

// Get game images. Thumbnail & Full
function get_images(obj) {
  var arr = []
  for (value in obj['screenshots']) {
    var x = {
      thumbnail: obj['screenshots'][value]['path_thumbnail'],
      full: obj['screenshots'][value]['path_full'],
    }
    arr.push(x)
  }
  return arr
}

// Get game support info. Email & Website
function get_support_info(obj) {
  const newObj = {
    url: check_exists(obj['support_info'].url) && obj['support_info'].url > 0 ? obj['support_info'].url : null,
    email: check_exists(obj['support_info'].email) && obj['support_info'].email > 0 ? obj['support_info'].email : null,
  }
  return newObj
}

// Get game trailer. Name & MP4
function get_movies(obj) {
  const newObj = {
    name: check_exists(obj['movies']) ? obj['movies'][0]['name'] : null,
    mp4: check_exists(obj['movies']) ? obj['movies'][0]['mp4'].max : null,
  }
  return newObj
}

// Get game descriptions. Short, Long & About
function get_description(obj) {
  const newObj = {
    short_desc: check_exists(obj['short_description']) ? strip_html(obj['short_description']) : null,
    long_desc: check_exists(obj['detailed_description']) ? strip_html(obj['detailed_description']) : null,
    about_desc: check_exists(obj['about_the_game']) ? strip_html(obj['about_the_game']) : null,
  }
  return newObj
}

// Get game requirements. Minimum & Recommended
function get_requirements(obj) {
  const newObj = {
    pc_req: {
      minimum: check_exists(obj['pc_requirements'].minimum) ? strip_html(obj['pc_requirements'].minimum) : null,
      recommended: check_exists(obj['pc_requirements'].recommended) ? strip_html(obj['pc_requirements'].recommended) : null,
    },
    mac_req: {
      minimum: check_exists(obj['mac_requirements'].minimum) ? strip_html(obj['mac_requirements'].minimum) : null,
      recommended: check_exists(obj['mac_requirements'].recommended) ? strip_html(obj['mac_requirements'].recommended) : null,
    },
  }
  return newObj
}

function get_tags(obj) {
  const arr = []
  for (var i = 0; i < 5; i++) {
    arr[i] = Object.keys(obj.tags)[i]
  }
  return arr
}

// Check if input prop exists
function check_exists(property) {
  return typeof property == 'undefined' ? false : true
}

// Strip HTML tags from string
function strip_html(obj) {
  obj = obj.replace(/(<([^>]+)>)/gi, '')
  obj = obj.replace(/\t/g, ' ')
  obj = obj.replace(/\s{2,}/g, ' ').trim()
  return obj // I dont understand regex
}

// generate_game_data()
exports.default = async (req, res) => {
  const path = 'data/game_data.json'
  if (fs.existsSync(path)) {
    console.log('\nData exists\n')

    fs.readFile(path, 'utf8', (err, jsonString) => {
      res.json(JSON.parse(jsonString))
    })
  } else {
    console.log('\nPlease wait... Generating data\n')

    await generate_game_data()
    fs.readFile(path, 'utf8', (err, jsonString) => {
      res.json(JSON.parse(jsonString))
    })
  }
}
