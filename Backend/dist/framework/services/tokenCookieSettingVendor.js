"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCookieVendor = void 0;
const setCookieVendor = (res, refreshToken) => {
    const maxAge = Number(process.env.REFRESH_TOKEN_MAX_AGE);
    res.cookie('vendor_refresh', refreshToken, {
        httpOnly: true,
        secure: false,
        maxAge: maxAge
    });
};
exports.setCookieVendor = setCookieVendor;
