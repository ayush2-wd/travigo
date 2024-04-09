if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}
console.log(process.env);

const express= require("express");
const app= express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate= require("ejs-mate");
const ExpressError= require("./utils/ExpressError.js");
const listingsRouter= require("./routes/listing.js");
const reviewsRouter= require("./routes/review.js");
const userRouter= require("./routes/user.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport= require("passport");
const LocalStrategy= require("passport-local");
const User= require("./models/user.js");

//setting basic connections
// const MONGO_URL="mongodb://127.0.0.1:27017/travigo";
const dbUrl = process.env.ATLAS_DB_URL;

main()
.then(()=>{
    console.log("connected to db");
})
.catch((err)=>{
    console.log(err);
});
async function main(){
    await mongoose.connect(dbUrl);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.static(path.join(__dirname,"/views")));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 *3600,
});

store.on("error",()=>{
    console.log("ERROR in MONGO SESSSION STORE", err);
})

const sessionOptions ={
    store,
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() +1000*60*60*24*3,
        maxAge: 1000 * 60 * 60 * 24 * 3,
        httpOnly:true
    },
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    // res.locals.isHome = (req.url === '/');
    res.locals.curUser = req.user;
    next();
})
// Build for demo user ; may not be needed in future; aeid code: 
// app.get("/demouser",async (req,res)=>{
//     let fakeUser= new User({
//         email: "student@gmail.com",
//         username: "delta-student"
//     });
//     let registeredUser= await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
// })

//Home
app.get("/",(req,res)=>{
    res.render('Home/home');
});


app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/",userRouter);

app.get("/solotrip", (req,res)=>{
    res.render("solotrip/solotrip.ejs");
}); 

app.get("/attractions",(req,res)=>{
    res.render("Tourist_Attractions/ta.ejs")
});

app.get('/terms', (req, res) => {
    res.render('includes/terms.ejs'); 
});

app.get('/privacy', (req, res) => {
    res.render('includes/privacy.ejs'); 
});

//Not found pages
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found"));

});

app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something went Wrong"}=err;
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message);
    
})

app.listen(8080, ()=>{
    console.log("Server is listening to port 8080");
});