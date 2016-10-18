var region = 'ap-northeast-1';

var IdentityPoolId = {
    AWS: 'ap-northeast-1:4a0a8023-7770-499a-a92e-e8cd3d788871', // <YOUR_IDENTITY_POOL_ID>
    AWSCognito: 'ap-northeast-1_uSVyq55eG' // <YOUR_USER_POOL_ID>
};

var ClientId = '6elsp8qa9ecfbj8la64vrkr8ts'; // アプリID

///////////////////

var idp = ['cognito-idp', region, 'amazonaws', 'com'].join(".");

var endpoint = [idp, IdentityPoolId.AWSCognito].join("/");

// Examples: Using the JavaScript SDK
// http://docs.aws.amazon.com/cognito/latest/developerguide/using-amazon-cognito-user-identity-pools-javascript-examples.html

// Source
// https://github.com/aws/amazon-cognito-identity-js

// Documents
// http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentity.html

// Initialize the Amazon Cognito credentials provider
AWS.config.region = region; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId.AWS
});

// Initialize the Amazon Cognito credentials provider
AWSCognito.config.region = region; // Region
AWSCognito.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId.AWSCognito
});

var data = {
    UserPoolId: IdentityPoolId.AWSCognito,
    ClientId: ClientId
};
var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(data);

var cognitoUser;

function message(div, message_text, message_class) {
    div.text(message_text);
    div.addClass(message_class);
    div.show();
    // setTimeout(function() {
    //     div.fadeOut(); // Don't work iOS.
    //     div.removeClass(message_class);
    // }, 4000);
    div.fadeOut(4000, function() {
        div.removeClass(message_class);
    });
}

// Use case 1. Registering a user with the application.
$('#user_add_btn').click(function() {
    var username = $("#inputUsername").val();
    var password = $("#inputPassword").val();

    var email = $("#inputEmail").val();
    var locale = $("#inputLocale").val();

    var attributeList = [];
    attributeList.push({Name: "email", Value: email});
    attributeList.push({Name: "locale", Value: locale});

    if (!username || !password) {
        return false;
    }

    userPool.signUp(username, password, attributeList, null, function(err, result) {
        if (err) {
            console.log(err);
            message($('#message'), err, "alert-danger");
        } else {
            cognitoUser = result.user;
            console.log('user name is ' + cognitoUser.getUsername());
            var message_text = cognitoUser.getUsername() + "が作成されました";
            message($('#message'), message_text, "alert-success");
        }
    });
});

// Use case 2. Confirming a registered, unauthenticated user using a confirmation code received via e-mail.
$('#user_confirm_btn').click(function() {
    var username = $("#inputUsername2").val();
    var code = $("#inputVerificationCode").val();

    var userData = {
        Username: username,
        Pool: userPool
    };

    console.log('Username: ' + username);
    console.log('Confirm code: ' + code);

    var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
    cognitoUser.confirmRegistration(code, true, function(err, result) {
        if (err) {
            console.log(err);
            message($('#message2'), err, "alert-danger");
        } else {
            console.log('user name is ' + cognitoUser.username);
            var message_text = "[" + result + "] " + cognitoUser.username + " が確認されました";
            message($('#message2'), message_text, "alert-success");
        }
    });
});

// Use case 4. Authenticating a user and establishing a user session with the Amazon Cognito Identity service.
$('#user_login_btn').click(function() {
    var username = $("#inputUsername3").val();
    var password = $("#inputPassword3").val();

    console.log(username + " : " + password);

    var authenticationData = {
        Username: username,
        Password: password
    };
    var authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);

    var userData = {
        Username: username,
        Pool: userPool
    };
    var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {

        onSuccess: function(result) {

            console.log("Login success : " + username);

            var message_text = "[SUCCESS] " + cognitoUser.username + " が認証されました";
            message($('#message3'), message_text, "alert-success");

            var acToken = result.getAccessToken().getJwtToken();
            var idToken = result.getIdToken().getJwtToken();
            console.log('access token + ' + acToken);

            var Logins = {};
            Logins[endpoint] = idToken;

            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: IdentityPoolId.AWS, // your identity pool id here
                Logins: Logins
            });

        },

        onFailure: function(err) {
            alert(err);
            message($('#message3'), err, "alert-danger");
        }

    });
});

