"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorRoute = void 0;
const express_1 = require("express");
const vendorInject_1 = require("../../inject/vendorInject");
const serviceInject_1 = require("../../inject/serviceInject");
const checkRoleBaseMiddleware_1 = require("../../../adapters/middlewares/checkRoleBaseMiddleware");
const chatInject_1 = require("../../inject/chatInject");
class VendorRoute {
    constructor() {
        this.vendorRoute = (0, express_1.Router)();
        this.setRoute();
    }
    setRoute() {
        this.vendorRoute.post('/sendOtp', (req, res) => {
            vendorInject_1.injectedVendorAuthenticationController.sendOtp(req, res);
        });
        this.vendorRoute.post('/signup', (req, res) => {
            vendorInject_1.injectedVendorAuthenticationController.registerVendor(req, res);
        });
        this.vendorRoute.post('/login', (req, res) => {
            vendorInject_1.injectedVendorLoginLogoutController.handleLoginVendor(req, res);
        });
        this.vendorRoute.post('/resendOtp', (req, res) => {
            vendorInject_1.injectedVendorAuthenticationController.handleResendOtp(req, res);
        });
        this.vendorRoute.post('/sendMail', (req, res) => {
            vendorInject_1.injectedForgotPasswordVendorController.handleSendEmailForgetPasswordVendor(req, res);
        });
        this.vendorRoute.post('/forgotPassword', (req, res) => {
            vendorInject_1.injectedForgotPasswordVendorController.handleResetPasswordVendor(req, res);
        });
        this.vendorRoute.patch('/changePassword', (req, res) => {
            vendorInject_1.injectedProfileVendorController.handleChangePasswordVendor(req, res);
        });
        this.vendorRoute.patch('/updateDetails', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('vendor'), serviceInject_1.injectedVendorStatusCheckingMiddleware, (req, res) => {
            vendorInject_1.injectedProfileVendorController.handleUpdateAboutAndPhone(req, res);
        });
        this.vendorRoute.post('/createEvent/:vendorId', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('vendor'), serviceInject_1.injectedVendorStatusCheckingMiddleware, (req, res) => {
            vendorInject_1.injectedEventController.handleCreateEvent(req, res);
        });
        this.vendorRoute.get('/showEvents/:pageNo/:vendorId', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('vendor'), serviceInject_1.injectedVendorStatusCheckingMiddleware, (req, res) => {
            vendorInject_1.injectedEventController.handleFindAllEventsVendor(req, res);
        });
        this.vendorRoute.put('/updateEvent', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('vendor'), serviceInject_1.injectedVendorStatusCheckingMiddleware, (req, res) => {
            vendorInject_1.injectedEventController.handleUpdateEvent(req, res);
        });
        this.vendorRoute.get('/wallet/:userId/:pageNo', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('vendor'), serviceInject_1.injectedVendorStatusCheckingMiddleware, (req, res) => {
            vendorInject_1.injectedWalletVendorController.handleShowWalletDetaills(req, res);
        });
        this.vendorRoute.get('/ticketDetailsWithUser', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('vendor'), serviceInject_1.injectedVendorStatusCheckingMiddleware, (req, res) => {
            vendorInject_1.injectedTicketVendorController.handleTicketAndUserDetails(req, res);
        });
        this.vendorRoute.post('/logout', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('vendor'), serviceInject_1.injectedVendorStatusCheckingMiddleware, (req, res) => {
            vendorInject_1.injectedVendorLoginLogoutController.handleVendorLogout(req, res);
        });
        this.vendorRoute.post('/createWorkSample', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('vendor'), serviceInject_1.injectedVendorStatusCheckingMiddleware, (req, res) => {
            vendorInject_1.injectedWorkSampleController.handleAddWorkSample(req, res);
        });
        this.vendorRoute.get('/workSamples', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('vendor'), serviceInject_1.injectedVendorStatusCheckingMiddleware, (req, res) => {
            vendorInject_1.injectedWorkSampleController.handleFindWorkSampleOfVendor(req, res);
        });
        this.vendorRoute.get('/categories', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('vendor'), serviceInject_1.injectedVendorStatusCheckingMiddleware, (req, res) => {
            vendorInject_1.injectedServiceVendorControllerUseCase.handleFindCategoryForServiceUseCase(req, res);
        });
        this.vendorRoute.post('/createService', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('vendor'), serviceInject_1.injectedVendorStatusCheckingMiddleware, (req, res) => {
            vendorInject_1.injectedServiceVendorControllerUseCase.handleCreateService(req, res);
        });
        this.vendorRoute.get('/services', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('vendor'), serviceInject_1.injectedVendorStatusCheckingMiddleware, (req, res) => {
            vendorInject_1.injectedServiceVendorControllerUseCase.handleFindService(req, res);
        });
        this.vendorRoute.put('/editService', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('vendor'), serviceInject_1.injectedVendorStatusCheckingMiddleware, (req, res) => {
            vendorInject_1.injectedServiceVendorControllerUseCase.handleEditService(req, res);
        });
        this.vendorRoute.patch('/changeStatusService', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('vendor'), serviceInject_1.injectedVendorStatusCheckingMiddleware, (req, res) => {
            vendorInject_1.injectedServiceVendorControllerUseCase.handleChangeStatusUseCase(req, res);
        });
        this.vendorRoute.get('/showBookings/:vendorId/:pageNo', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('vendor'), serviceInject_1.injectedVendorStatusCheckingMiddleware, (req, res) => {
            vendorInject_1.injectedBookingVendorController.handleShowBookingsInVendor(req, res);
        });
        this.vendorRoute.patch('/approveBooking', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('vendor'), (req, res) => {
            vendorInject_1.injectedBookingVendorController.handleApproveBooking(req, res);
        });
        this.vendorRoute.patch('/rejectBooking', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('vendor'), serviceInject_1.injectedVendorStatusCheckingMiddleware, (req, res) => {
            vendorInject_1.injectedBookingVendorController.handleRejectBookingInVendor(req, res);
        });
        this.vendorRoute.patch('/completeBooking', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('vendor'), serviceInject_1.injectedVendorStatusCheckingMiddleware, (req, res) => {
            vendorInject_1.injectedBookingVendorController.handleUpdateBookingComplete(req, res);
        });
        this.vendorRoute.get('/loadPreviousChat', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('vendor'), serviceInject_1.injectedVendorStatusCheckingMiddleware, (req, res) => {
            chatInject_1.injectedLoadPreviousChatController.handleLoadPreviousMessage(req, res);
        });
        this.vendorRoute.get('/chats', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('vendor'), serviceInject_1.injectedVendorStatusCheckingMiddleware, (req, res) => {
            chatInject_1.injectedFindChatsOfUserController.handleFindChatOfUser(req, res);
        });
        this.vendorRoute.post('/verifyTicket', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('vendor'), serviceInject_1.injectedVendorStatusCheckingMiddleware, (req, res) => {
            vendorInject_1.injectedTicketVendorController.handleTicketConfirmation(req, res);
        });
        this.vendorRoute.get('/transactions', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('vendor'), serviceInject_1.injectedVendorStatusCheckingMiddleware, (req, res) => {
            vendorInject_1.injectedWalletVendorController.handleFindTransactionsByPaymentStatus(req, res);
        });
    }
}
exports.VendorRoute = VendorRoute;
