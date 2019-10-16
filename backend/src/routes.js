const { Router} = require('express')

const routes = new Router()

routes.get('/',(req, res)=>{
  res.json({mensage: 'hello world'})
})

module.exports = routes