"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRoute = void 0;
const express_1 = require("express");
const adminInject_1 = require("../../inject/adminInject");
const serviceInject_1 = require("../../inject/serviceInject");
class AdminRoute {
    constructor() {
        this.adminRoute = (0, express_1.Router)();
        this.setRoute();
    }
    setRoute() {
        this.adminRoute.post('/login', (req, res) => {
            adminInject_1.injectedAdminLoginController.handleAdminLogin(req, res);
        });
        this.adminRoute.patch('/blockClient', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, serviceInject_1.checkAdminMiddleWare, (req, res) => {
            adminInject_1.injectedUserManagementController.handleClientBlock(req, res);
        });
        this.adminRoute.patch('/unblockClient', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, serviceInject_1.checkAdminMiddleWare, (req, res) => {
            adminInject_1.injectedUserManagementController.handleClientUnblock(req, res);
        });
        this.adminRoute.get('/clients', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, serviceInject_1.checkAdminMiddleWare, (req, res) => {
            adminInject_1.injectedUserManagementController.findAllClient(req, res);
        });
        this.adminRoute.get('/vendors', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, serviceInject_1.checkAdminMiddleWare, (req, res) => {
            adminInject_1.injectedFindVendorsController.findAllVendor(req, res);
        });
        this.adminRoute.patch('/blockVendor', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, serviceInject_1.checkAdminMiddleWare, (req, res) => {
            adminInject_1.injectedBlockUnblockController.handleVendorBlock(req, res);
        });
        this.adminRoute.patch('/unblockVendor', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, serviceInject_1.checkAdminMiddleWare, (req, res) => {
            adminInject_1.injectedBlockUnblockController.handleVendorUnblock(req, res);
        });
        this.adminRoute.get('/pendingVendors', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, serviceInject_1.checkAdminMiddleWare, (req, res) => {
            adminInject_1.injectedFindVendorsController.findPendingVendor(req, res);
        });
        this.adminRoute.patch('/rejectVendor', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, serviceInject_1.checkAdminMiddleWare, (req, res) => {
            adminInject_1.injectedVendorStatusController.handleRejectVendor(req, res);
        });
        this.adminRoute.patch('/approveVendor', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, serviceInject_1.checkAdminMiddleWare, (req, res) => {
            adminInject_1.injectedVendorStatusController.handleApproveVendor(req, res);
        });
        this.adminRoute.get('/search', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, serviceInject_1.checkAdminMiddleWare, (req, res) => {
            adminInject_1.injectedUserManagementController.searchClient(req, res);
        });
        this.adminRoute.get('/searchVendor', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, serviceInject_1.checkAdminMiddleWare, (req, res) => {
            adminInject_1.injectedBlockUnblockController.searchVendor(req, res);
        });
        this.adminRoute.get('/wallet/:userId/:pageNo', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, serviceInject_1.checkAdminMiddleWare, (req, res) => {
            adminInject_1.injectedAdminWalletController.handleFindWalletDetails(req, res);
        });
        this.adminRoute.get('/categories', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, serviceInject_1.checkAdminMiddleWare, (req, res) => {
            adminInject_1.injectedCategoryController.handleFindCategory(req, res);
        });
        this.adminRoute.post('/createCategory', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, serviceInject_1.checkAdminMiddleWare, (req, res) => {
            adminInject_1.injectedCategoryController.handleCreatecategory(req, res);
        });
        this.adminRoute.patch('/changeStatusCategory', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, serviceInject_1.checkAdminMiddleWare, (req, res) => {
            adminInject_1.injectedCategoryController.handleChangeCategoryStatus(req, res);
        });
        this.adminRoute.patch('/updateCategory', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, serviceInject_1.checkAdminMiddleWare, (req, res) => {
            adminInject_1.injectedCategoryController.handleUpdateCategory(req, res);
        });
        this.adminRoute.get('/eventDetails', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, serviceInject_1.checkAdminMiddleWare, (req, res) => {
            adminInject_1.injectedFindEventsInAdminSideController.handleListingEventsInAdminSide(req, res);
        });
        this.adminRoute.get('/transactions', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, serviceInject_1.checkAdminMiddleWare, (req, res) => {
            adminInject_1.injectedAdminWalletController.handleFindWalletByPaymentStatus(req, res);
        });
        this.adminRoute.get('/dashboard', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, serviceInject_1.checkAdminMiddleWare, (req, res) => {
            adminInject_1.injectedDashboardAdminController.handleAdminDashboardata(req, res);
        });
    }
}
exports.AdminRoute = AdminRoute;
