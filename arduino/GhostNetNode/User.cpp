#include "User.h"
#include "LoRaRadio.h"
#include <Arduino.h>
#include <Preferences.h>

int UserManager::userCount = 0;
Preferences UserManager::prefs;

User UserManager::users[MAX_USERS];

void UserManager::init() {
    loadUsersNVS();
}

bool UserManager::addUser(const String& username, const String& password, const String& team) {
    Serial.printf("[User] Adding new user: %s\n", username.c_str());
    Serial.printf("[User] New password hash: %s\n", hashPassword(password).c_str());
    Serial.printf("[User] New team: %s\n", team.c_str());
    if (userCount >= MAX_USERS) return false;
    
    if (usernameExists(username)) return false;
    
    Serial.println("[User] Username does not exist, proceeding to add.");
    
    User user;
    user.username = username;
    user.passwordHash = hashPassword(password);
    user.team = team;
    user.token = generateToken();
    UserManager::users[userCount++] = user;
    Serial.println("[User] User added to array, saving to NVS.");
    Serial.printf("[User] Total users now: %d\n", userCount);
    saveUsersNVS();

    String msg = serializeUser(user);
    extern LoRaRadio LoRa;
    LoRa.sendToQueueString("USER", msg);
    return true;
}

bool UserManager::addUserFromLoRa(const User& user) {
    if (userCount >= MAX_USERS) return false;

    if (usernameExists(user.username)) return false;

    Serial.println("[User] Adding user from LoRa: " + user.username);
    UserManager::users[userCount++] = user;
    Serial.println("[User] User added successfully");
    saveUsersNVS();
    return true;
}

bool UserManager::usernameExists(const String& username) {
    for (int i = 0; i < userCount; ++i) {
        if (UserManager::users[i].username == username) return true;
    }
    return false;
}

int UserManager::getUserCount() {
    return userCount;
}

User UserManager::getUser(int idx) {
    if (idx < 0 || idx >= userCount) return User();
    return UserManager::users[idx];
}

String UserManager::serializeUser(const User& user) {
    return user.username + "," + user.passwordHash + "," + user.team + "," + user.token;
}

User UserManager::deserializeUser(const String& data) {
    User user;
    int idx1 = data.indexOf(',');
    int idx2 = data.indexOf(',', idx1 + 1);
    int idx3 = data.indexOf(',', idx2 + 1);
    user.username = data.substring(0, idx1);
    user.passwordHash = data.substring(idx1 + 1, idx2);
    user.team = data.substring(idx2 + 1, idx3);
    user.token = data.substring(idx3 + 1);
    return user;
}

String UserManager::generateToken() {
    String token = "";
    for (int i = 0; i < 16; ++i) {
        token += String(random(0, 16), HEX);
    }
    return token;
}

String UserManager::hashPassword(const String& password) {
    uint32_t hash = 5381;
    for (size_t i = 0; i < password.length(); ++i) {
        hash = ((hash << 5) + hash) + password[i];
    }
    Serial.printf("[User] Hashed password: %s to %s\n", password.c_str(), String(hash, HEX).c_str());
    return String(hash, HEX);
}

String UserManager::listUsernamesAndTeams() {
    String result;
    for (int i = 0; i < userCount; ++i) {
        result += UserManager::users[i].username + " (" + UserManager::users[i].team + ")\n";
    }
    return result;
}

String UserManager::getNameAndTeamByToken(const String& token) {
    for (int i = 0; i < userCount; ++i) {
        if (UserManager::users[i].token == token) {
            return UserManager::users[i].username + "," + UserManager::users[i].team;
        }
    }
    return "";
}

String UserManager::createSession(const String& username) {
    for (int i = 0; i < userCount; ++i) {
        if (UserManager::users[i].username == username) {
            return UserManager::users[i].token;
        }
    }
    return "";
}

bool UserManager::isValidSession(const String& token) {
    for (int i = 0; i < userCount; ++i) {
        if (UserManager::users[i].token == token) return true;
    }
    return false;
}

bool UserManager::isValidLogin(const String& username, const String& passwordHash) {
    Serial.printf("[User] Validating password for user: %s\n", username.c_str());
    Serial.printf("[User] usercount: %d\n", userCount);
    for (int i = 0; i < userCount; ++i) {
        Serial.printf("[User] Checking user: %s\n", UserManager::users[i].username.c_str());
        Serial.printf("[User] Stored hash: %s\n", UserManager::users[i].passwordHash.c_str());
        if (UserManager::users[i].username == username && UserManager::users[i].passwordHash == passwordHash) {
            Serial.println("[User] Password valid");
            return true;
        }
    }
    return false;
}

void UserManager::loadUsersNVS() {
    Serial.println("[User] Loading users from NVS");
    prefs.begin("users", true);
    userCount = prefs.getInt("count", 0);
    if (userCount > MAX_USERS) userCount = MAX_USERS;
    
    for (int i = 0; i < userCount; ++i) {
        Serial.println("[User] Loading user " + String(i));
        String key = "user" + String(i);
        String line = prefs.getString(key.c_str(), "");
        if (line.length() > 0) {
            UserManager::users[i] = deserializeUser(line);
        }
    }
    if (userCount == 0) {
        Serial.println("[User] No users found in NVS");
        addUser("admin", "admin", "admin");
    }
    Serial.printf("[User] Loaded %d users from NVS\n", userCount);
    prefs.end();
}

void UserManager::saveUsersNVS() {
    Serial.println("[User] Saving users to NVS");
    prefs.begin("users", false);
    prefs.clear();
    prefs.putInt("count", userCount);
    for (int i = 0; i < userCount; ++i) {
        Serial.println("[User] Saving user: " + UserManager::users[i].username);
        String key = "user" + String(i);
        String line = serializeUser(UserManager::users[i]);
        prefs.putString(key.c_str(), line);
    }
    prefs.end();
    Serial.println("[User] Users saved to NVS");
}
