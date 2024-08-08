const pool = require("../Config/dbConfig")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

exports.register = async (req, res) => {
    const {name, email, password} = req.body
    const hashedP = await bcrypt.hash(password, 10)

    try {
        await pool.query(`INSERT INTO users (name, email, password) VALUES(?,?,?)`, [name,email,hashedP])
        res.redirect("http://localhost:3231")
    }
    catch (error) {
        res.status(500).json({ error: "Error en la base de datos" })
    }
}

exports.login = async(req, res) => {
    const {email, password} = req.body

    try{
        const [rows] = await pool.query(`SELECT * FROM users where email = ?`, [email])

        if(rows.length > 0 && await bcrypt.compare(password, rows[0].password)){
            const token = jwt.sign({id: rows[0].id}, "Tu jwt secreto", {expiresIn: "1h"})
            res.cookie('authToken', token, { httpOnly: true, secure: false });
            res.redirect("http://localhost:3231/inicio");
        }else{
            res.status(401).json({error: "No estas autorizado"})
        }
    }catch(error){
        res.status(500).json({ error: "Error en la base de datos" })
    }    
}

exports.logout = (req, res) => {
    res.clearCookie('authToken')
    res.redirect('/')
};

