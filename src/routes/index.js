const { Router } = require('express');
const router = Router();

router.get('/', (req, res) => {
    res.json({ "title": "hello world" });
});

module.exports = router;