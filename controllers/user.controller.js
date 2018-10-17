import UserModel from '../models/user.model'
import calculateDistance from '../util/calculateDistance';

export async function register(req, res) {
    let user = new UserModel();
    if (req.body.username && req.body.password && req.body.latitude && req.body.longtitude) {
        user.username = req.body.username;
        user.password = req.body.password;
        user.latitude = req.body.latitude;
        user.longtitude = req.body.longtitude;
    }
    await user.save(err => {
        if (err) {
            err.status = 400;
            return res.json(err);
        }
        
        res.json({
            status: "success",
            message: "User has been registered",
            data: user
        });
    });
}


export async function login(req, res, next) {
    if (req.body.username && req.body.password) {
        UserModel.authenticate(req.body.username, req.body.password, function(err, user) {
            if (err || !user) {
                res.json({
                    status: "error",
                    message: "Incorrect username or password",
                })
            } else if (user) {
                req.session.userId = user._id;
                res.json({
                    status: "success",
                    message: "User has been logged in",
                    data: user
                });
            } 
        });
    } else {
        res.json({
            status: "error",
            message: "Username and Password must be present in request body",
        });
    }
};

export async function track(req, res, next) {
    if (req.session.userId === null) {
        res.json({
            status: 'error', 
            message: "Please log in to track"
        });
    }
    let {latitude, longtitude } = req.body
    if (!latitude || !longtitude) {
        return res.json({
            status: 'error', 
            message: "Please provide your latitude & longtitude coordiantes as request body"
        });
        
    } 
    
    let user = await UserModel.findById(req.session.userId);
    let homeLat = null, homeLong = null;
    if (user){
        homeLat = user.latitude;
        homeLong = user.longtitude;
    }

    let distance = calculateDistance(homeLat,homeLong, latitude,longtitude);

    if ( distance >= 0  && !isNaN(distance)) {
        if (distance <= 0.200) {
            res.json({
                status: 'success', 
                message: `You are not far from home, only ${distance} km away. But keep your doors locked!`
            });
        } else {
            res.json({
                status: 'success', 
                message: ` YOU ARE LEAVING YOUR HOUSE. You are  ${distance} km away from house. DO NOT FORGET TO LOCK YOUR DOORS!!!!!!!!!`
            });
        }
    } else {
        res.json({
            status: 'error', 
            message: "Unfortunately there was an error processing your distance."
        });
    }
}

export async function updateLocation(req, res, next) {
    let {latitude, longtitude} = req.body
    console.log(latitude,longtitude)
    if (req.session.userId === null) {
        res.json({
            status: 'error', 
            message: "Please log in to update location by providing your username and password"
        });
    }
    if (!latitude && !longtitude ) {
        res.json({
            status: 'error', 
            message: "Please provide new latitude and longtitude data"
        });
    }

    const user = await UserModel.findOneAndUpdate({_id: req.session.userId}, { latitude, longtitude } );
    console.log(user)
    res.json({
        status: "success",
        message: `Your coordinates have been updated as latitude: ${latitude}, longtitude: ${longtitude}`,
    });

}

export async function logout(req, res, data) {
    if (req.session.userId) {
        req.session.userId = null;
        res.json({
            status: "success",
            message: "You are logged out",
            // data: user
        });
    } 

    // res.json({
    //     status: "success",
    //     message: "You are logged out",
    //     // data: user
    // });
}
