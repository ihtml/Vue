<template>
  <div class="home">
    <home-header :header="header"></home-header>
    <home-swiper :list="swiperList"></home-swiper>
    <home-icons :list="iconList"></home-icons>
    <home-list-item></home-list-item>
    <home-active-con></home-active-con>
    <home-hot-list :list="hotList"></home-hot-list>
    <home-guess :list="guessList"></home-guess>
    <home-weekend :list="weekendList"></home-weekend>
  </div>
</template>

<script>
import HomeHeader from './components/Header'
import HomeSwiper from './components/Swiper'
import HomeIcons from './components/Icons'
import HomeListItem from './components/ListItem'
import HomeActiveCon from './components/ActiveCon'
import HomeHotList from './components/HotList'
import HomeGuess from './components/Guess'
import HomeWeekend from './components/Weekend'
import axios from 'axios'
import { mapState } from 'vuex'
export default {
  name: 'Home',
  components: {
    HomeHeader,
    HomeSwiper,
    HomeIcons,
    HomeListItem,
    HomeActiveCon,
    HomeHotList,
    HomeGuess,
    HomeWeekend
  },
  data () {
    return {
      header: {},
      swiperList: [],
      iconList: [],
      hotList: [],
      guessList: [],
      recommendList: [],
      weekendList: []
    }
  },
  computed: {
    ...mapState(['city'])
  },
  methods: {
    getHomeInfo () {
      // 选择新城市后会重新发送请求
      axios.get('/api/index.json?city=' + this.city)
        .then(this.getHomeInfoSucc)
      // axios.get('/user/travel')
      //   .then(this.getHomeInfoSucc)
      // axios.get('/public/travel')
      //   .then(this.getHomeInfoSucc)
    },
    getHomeInfoSucc (res) {
      res = res.data
      if (res.ret && res.data) {
        const data = res.data
        this.header = data.header
        this.swiperList = data.swiperList
        this.iconList = data.iconList
        this.recommendList = data.recommendList
        this.guessList = data.guessList
        this.hotList = data.hotList
        this.weekendList = data.weekendList
      }
    }
  },
  mounted () {
    this.lastCity = this.city
    this.getHomeInfo()
  },
  // keep-alive组件激活时调用
  activated () {
    if (this.lastCity !== this.city) {
      this.lastCity = this.city
      this.getHomeInfo()
    }
  }
}
</script>

<style lang="stylus" scoped>
.home
  background #f5f5f5
</style>
