var express       = require('express'),
    app           = express(),
    bodyParser    = require('body-parser'),
    mongoose      = require('mongoose'),
    passport      = require('passport'),
    LocalStrategy = require('passport-local'),
    Campground    = require('./models/campground'),
    Comment       = require('./models/comment'),
    User          = require('./models/user'),
    seedDB        = require('./seeds')

//seedDB();
//app config//
mongoose.connect("mongodb://pradhumna:data6629@ds253891.mlab.com:53891/pnpcamp");
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

//passport config//
app.use(require('express-session')({
    secret: 'I am the Best',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//landing page//
app.get('/', function(req,res){
    res.render('landing');
});

//Index route -> shows all the campgrounds//
app.get('/campgrounds', function(req,res){
    //get all campgrounds from database//
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        }else{
            res.render("campgrounds/index", {campgrounds : allCampgrounds});
        }
    });
});

//Create route -> adds new campground//
app.post('/campgrounds', function(req, res){
    //get data from form and add to campground array//
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var newCampground = {name: name, image: image, description: desc }
    //create a new campground and save it to DB yelp_camp//
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        }else{
            res.redirect('/campgrounds');
        }
    });
});

//New route -> displays from to add new campground//
app.get('/campgrounds/new', function(req,res){
    res.render('campgrounds/new');
});

//Show route -> display about particular campground//
app.get('/campgrounds/:id', function(req, res){
    //find the campground with provided id//
    Campground.findById(req.params.id).populate('comments').exec(function(err, foundCampground){
        if(err){
            console.log(err);
        }else{
            //render show template with more info//
            res.render("campgrounds/show", {campground : foundCampground});
        }
    }); 
});

//==================================Comment Routes=================================================//
app.get('/campgrounds/:id/comments/new', function(req, res){
    //find campground by id//
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        }else{
            res.render('comments/new', {campground : campground});
        } 
    });  
});

app.post('/campgrounds/:id/comments', function(req, res){
    //find the campground using id//
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        }else{
            //create comment//
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                    res.redirect('/campgrounds');
                }else{
                     //associate comment with campground//
                     campground.comments.push(comment);
                     campground.save();
                     //redirect to show page//
                     res.redirect('/campgrounds/' + campground._id);
                }
            });
        }
    });
});
//=================================================================================================//

//=====================================Auth Routes=================================================//

//show sigup form//
app.get('/register', function(req, res){
    res.render('register');
});

//handle sign up logic//
app.post('/register', function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render('register');
        } 
            passport.authenticate('local')(req, res, function(){
            res.redirect('/campgrounds');
            });
    });
});

//show login form//
app.get('/login', function(req, res){
    res.render('login');
});

//handle login logic//
app.post('/login', passport.authenticate('local',
    {
        successRedirect: '/campgrounds', 
        failureRedirect: '/login'
    }),function(req, res){
});

//Log out functionality//
app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/campgrounds');
});
//==================================================================================================//
app.listen(process.env.PORT, process.env.IP);