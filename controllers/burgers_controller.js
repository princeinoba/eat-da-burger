const express = require('express');
const Burger = require('../models/burger');

const router = express.Router();

//HTML Route
router.get('/', function(req, res) {
  res.redirect('/index');
});

router.get('/index', async function(req, res) {
  const burgers = await Burger.selectAll();
  res.render('index', {burgers});
});

//API Routes
router.get('/api/burgers', async function(req, res) {
  try {
    const burgers = await Burger.selectAll();
    res.status(200).json({data: burgers});
  } catch(err) {
    res.status(500).json(err);
  }
});

router.post('/api/burgers', async function(req, res) {
  try {
    const burger = new Burger(req.body);
    const result = await burger.save();

    burger.id = result.insertId;

    res.status(201).json({data: burger});
  } catch(err) {
    res.status(500).json(err);
  }
});

router.patch('/api/burgers/:id', async function(req, res) {
  let burger = await Burger.findBurger(req.params.id);
  if (!burger) return res.status(404).end();

  burger = Object.assign(burger, req.body, {id: req.params.id})

  try {
    await burger.save();
    res.status(200).json({data: burger});
  } catch(err) {
    res.status(500).json(err);
  }
});

router.delete('/api/burgers/:id', async function(req, res) {
  const burger = await Burger.findBurger(req.params.id);
  if(!burger) return res.status(404).end();

  try {
    await burger.deleteBurger();
    res.status(200).json({data: burger});
  } catch(err) {
    res.status(500).json(err);
  }
});

module.exports = router;