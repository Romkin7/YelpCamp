var express = require('express'),
    router  = express.Router({mergeParams : true}),
    Campground = require('../models/campground'),
    Comment    = require('../models/comment')

//displays form to create new comment//
router.get('/new', isLoggedIn, function(req, res){
    //find campground by id//
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
            res.redirect('/campgrounds');
        }else{
            res.render('comments/new', {campground : campground});
        } 
    });  
});

//adds new comment//
router.post('/', isLoggedIn, function(req, res){
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
                     // add username and id //
                     comment.author.id = req.user._id;
                     comment.author.username = req.user.username;
                     //save  comment//
                     comment.save();
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

//Edit Route//
router.get('/:comment_id/edit', function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            console.log(err);
        }else{
            res.render('comments/edit', {campground_id : req.params.id, comment : foundComment});
        }
    });  
});

//Update Route//
router.put('/:comment_id', checkCommentOwner, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            console.log(err);
        }else{
            res.redirect('/campgrounds/' + req.params.id);
        }
    });
});

//Delete Route//
router.delete('/:comment_id', checkCommentOwner, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect('back');
        }else{
            res.redirect('/campgrounds/' + req.params.id);
        }
    });
});

//middleware to check if user is logged in//
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
};

function checkCommentOwner(req, res, next){
    //if user logged in//
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                res.redirect('back');
            }else{
                //if user owns the comment//
                if(foundComment.author.id.equals(req.user._id)){
                    next();
                } else{
                    //redirect somewhere//
                    res.redirect('back');
                }
            }
        });       
    }else {
        //redirect if not logged in//
        res.redirect('back');
    }

};

module.exports = router;