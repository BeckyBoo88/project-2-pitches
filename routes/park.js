const express = require('express');
let router = express.Router();
const db = require('../models')
const axios = require('axios')
const park = process.env.PARK

// GET /list
// router.get('/list', (req, res) => {
//   res.render('list')
// })

// POST/list display parks based off zipcode, redirect to detail page
router.get('/list', (req, res) => {
    let currentUser = req.query.name
    let stateCode = req.query.stateCode

    db.user.findOrCreate({
      where: {
        name: currentUser,
        stateCode: stateCode
    }})

    let parkURL =`https://developer.nps.gov/api/v1/parks?stateCode=${stateCode}&sort=&api_key=${park}`
    axios.get(parkURL)
    .then((apiResponse) => {
        const parks= apiResponse.data.data
        // res.render(parks)
    
        res.render('list', {parks, currentUser})
        

    })
   .catch(error => console.log(error))
});

// GET detail page, user can add to favorites, redirect to favorite page

router.get('/detail', (req, res) => {
    let parkCode = req.query.parkCode
    let currentUser = req.query.name
    // let currentUser = db.user.findOne()
    console.log(currentUser, 'CURRENT USER!!!!!!!!!')
    console.log(parkCode, '!!!!!!!!PARKCODE!!!!!!!!!!')

    let parkURL =`https://developer.nps.gov/api/v1/parks?parkCode=${parkCode}&api_key=${park}`
    axios.get(parkURL)
    .then((apiResponse) => {
        const parkDets= apiResponse.data.data
        // console.log(parkDets, currentUser)
        
    
        res.render('detail', {parkDets, currentUser})

    })
   .catch(error => console.log(error))
});
// GET FAVORITE LIST OF SPECIFIC USER

router.get('/favorite', async (req, res) => {
  // Get all records from the DB of favorites
let currentUser = req.query.name
console.log(req.query, ' THIS IS WHAT IS IN THE FRICKIN BIDY!!!!!!!!!!!!!!!!!')
  let user = await db.user.findOne({
    where: {
      name: currentUser
    }
  })
    let fav = await user.getFavorites()
      res.render('favorite', {favorites: fav})
})

// GET/DELETE display user favorites, let them be able to delete from fav list
router.post('/favorite', async (req, res) => {

    try {
      let name = req.body.parkDet
      let currentUser = req.body.name

      const user = await db.user.findOne({
        where: {
          name: currentUser
        }
      })
      console.log(user)
      const newPark = await db.favorite.findOrCreate({
        where: {
          name: name
        }
      })
      await user.addFavorite(newPark[0])
      
      res.redirect(`/favorite?name=${currentUser}`)
    } catch (error) {
      console.log(`🆘 we have an error:`, error)
    }
})

  router.delete('/favorite/:name', (req, res) => {
    //access db for park info
    // use 'include db.user' to access specific user's park db
    // .then db.favorite.destroy where name is req.body.name
    console.log(req.params)
    let currentUser= req.body.name
    console.log(currentUser, '!!!!!!!!!!!!!🌈')

    db.favorite.destroy({
      where: {
        name: req.params.name
      }
    })
    .then ((data) => {
      console.log('The task has been done 😈')
      console.log(currentUser,'🚀')
      // . then res.redirect('back') (this will reload the page)
     res.redirect(`/favorite?name=${currentUser}`)
    })
    .catch((err) => {
      console.log(`Mayday mayday! We are going down!! 🛩  ${err}`)
    })
  })  

// get route so we can redirect to update page
router.get('/update', (req, res) => {
  res.render('update')
})

router.put('/update', (req, res) => {
  console.log(req.body)
 let stateCode = req.body.stateCode
 let name = req.body.name

  // find user in database
  // update their zipcode
  
  res.redirect(`/list?name=${name}&stateCode=${stateCode}`)

})

  // GET logout route
router.get('/logout', (req, res) => {
  res.render('index', {logout: true})
})


module.exports = router