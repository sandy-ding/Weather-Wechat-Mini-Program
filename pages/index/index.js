const weatherMap = {
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
}

const weatherColorMap = {
  'sunny': '#cbeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}

const QQMapWX = require('../../libs/qqmap-wx-jssdk.js')

Page({
  data:{
    nowTemp:'',
    nowWeather:'',
    nowWeatherBackground:'',
    forecast:[],
    todayDate:'',
    todayTemp:'',
    city:"广州市",
    locationTipsText:"点击获取当前位置"
  },
  onPullDownRefresh(){
    this.getNow(()=> {
      wx.stopPullDownRefresh()
    })
  },
  onLoad(){
    this.getNow()
    this.qqmapsdk = new QQMapWX({
      key: '63LBZ-UBHRU-AECVP-BBBWH-7W3YK-N6BFZ'
    })
  },
  getNow(callback){
    wx.request({
      url: "https://test-miniprogram.com/api/weather/now",
      data: {
        city: this.data.city
      },
      success: res => {
        console.log(res)
        let result = res.data.result
        this.setNow(result)
        this.setHourlyWeather(result)  
        this.setToday(result)
    },
      complete: ()=>{
        callback && callback()
      }
    })
  },
  setNow(result){
    let temp = result.now.temp
    let weather = result.now.weather
    console.log(temp, weather)
    this.setData({
      nowTemp: temp + '°',
      nowWeather: weatherMap[weather],
      nowWeatherBackground: '/images/' + weather + '-bg.png',
    })
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: weatherColorMap[weather],
    })
  },
  setHourlyWeather(result){
    //set forecast
    console.log(result)
    let forecast = result.forecast
    let nowHour = new Date().getHours()
    let hourlyWeather = []
    for (let i = 0; i < 7; i += 1) {
      hourlyWeather.push({
        time: (i * 3 + nowHour) % 24 + '时',
        iconPath: '/images/' + forecast[i].weather + '-icon.png',
        temp: forecast[i].temp + '°'
      })
    }
    hourlyWeather[0].time = '现在'
    this.setData({
      hourlyWeather: hourlyWeather
    })
  },
  setToday(result){
    let date = new Date()
    this.setData({
      todayTemp:`${result.today.minTemp}° - ${result.today.maxTemp}°`,
      todayDate:`${date.getFullYear()} - ${date.getMonth() + 1} - ${date.getDate()}  今天`
    })
  },
  onTapDayWeather(){
    wx.showToast()
    wx.navigateTo({
      url:'/pages/list/list',
    })
  },
  onTapLocation() {
    wx.getLocation({
      success: res => {
        this.qqmapsdk.reverseGeocoder({
          location:{
            latitude:res.latitude,
            longitude:res.longitude
          },
          success:res => {
            let city = res.result.address_component.city
            console.log(city)
            this.setData({
              city:city,
              locationTipsText:""
            })
            this.getNow()
          }
        })
      },
    })
  }
})
