// 目前node版本还不支持直接写import
const Router = require('koa-router')
const axios = require('axios')
const path = require('path')
const fs = require('fs')
// 从内存中读取和输出文件
const MemoryFS = require('memory-fs')
const webpack = require('webpack')
const VueServerRenderer = require('vue-server-renderer')

const serverRender = require('./server-render')
const serverConfig = require('../../build/webpack.config.server')

const serverCompiler = webpack(serverConfig)
const mfs = new MemoryFS()
serverCompiler.outputFileSystem = mfs
// 记录webpack每次打包生成的文件
let bundle
// 每次改了文件都会重新执行打包
serverCompiler.watch({}, (err, stats) => {
	// 如果打包出现错误 抛出错误
	if (err) throw err
	stats = stats.toJson()
	// 不是打包的错误
	stats.errors.forEach(err => console.log(err))
	stats.warnings.forEach(warn => console.warn(err))

	const bundlePath = path.join(
		serverConfig.output.path,
		'vue-ssr-server-bundle.json'
	)
	bundle = JSON.parse(mfs.readFileSync(bundlePath, 'utf-8'))
	console.log('new bundle generated')
})

const handleSSR = async (ctx) => {
	if (!bundle) {
		ctx.body = "wait a mintue"
		return
	}

	// axios发送请求拿到webpack-dev-server打包好的js文件
	const clientManifestResp = await axios.get(
		'http://127.0.0.1:8000/public/vue-ssr-client-manifest.json'
	)
	// 拿到返回的结果 静态资源的地址
	const clientManifest = clientManifestResp.data

	// const serverBundle = bundle
	const template = fs.readFileSync(
		path.join(__dirname, '../server.template.ejs'),
		'utf-8'
	)
	// 生成一个可以直接调用bundle的function
	const renderer = VueServerRenderer.createBundleRenderer(bundle, {
		inject: false, // 不使用官方的模板注入
		// 自动生成一个带有script标签的一个js文件引用的字符串,可以填到ejs的内容里面
		clientManifest
	})

	await serverRender(ctx, renderer, template)
}

const router = new Router()
router.get('*', handleSSR)

module.exports = router