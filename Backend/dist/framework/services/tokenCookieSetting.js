"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCookie = void 0;
const setCookie = (res, refreshToken) => {
    const maxAge = Number(process.env.REFRESH_TOKEN_MAX_AGE);
    res.cookie('client_refresh', refreshToken, {
        httpOnly: true,
        secure: false,
        maxAge: maxAge
    });
};
exports.setCookie = setCookie;
