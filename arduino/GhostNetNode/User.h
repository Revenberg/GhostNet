#pragma once
#include <Arduino.h>
#include <Preferences.h>
#define MAX_USERS 100

struct User {
    String username;
    String passwordHash;
    String team;
    String token;
};

class UserManager {
public:
    static void init();
    static bool addUser(const String& username, const String& password, const String& team);
    static bool addUserFromLoRa(const User& user);
    static bool usernameExists(const String& username);
    static bool isValidSession(const String& token);
    static int getUserCount();
    static User getUser(int idx);
    static String serializeUser(const User& user);
    static User deserializeUser(const String& data);
    static String generateToken();
    static String hashPassword(const String& password);
    static String listUsernamesAndTeams();
    static String getNameAndTeamByToken(const String& token);
    static String createSession(const String& username);
    static bool isValidLogin(const String& username, const String& password);

    static User users[MAX_USERS];
    static int userCount;
    static Preferences prefs;

    static void loadUsersNVS();
private:
    static void saveUsersNVS();
};
