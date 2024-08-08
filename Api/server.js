const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const csurf = require("csurf")
const authRoutes = require("./Routes/authRoutes")

const app = express();
const port = process.env.PORT || 3232;

app.use(cors({
    origin: 'http://localhost:3231',
    methods: ['GET', 'POST', 'DELETE'],
    credentials: true
}));


app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

const csrf = csurf({cookie: true})
app.use(csrf)

app.use((req, res, next) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    next();
});

app.use("/app", authRoutes)

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
    
})