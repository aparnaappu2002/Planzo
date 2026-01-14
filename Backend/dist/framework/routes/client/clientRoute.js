"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientRoute = void 0;
const express_1 = require("express");
const clientInject_1 = require("../../inject/clientInject");
const serviceInject_1 = require("../../inject/serviceInject");
const chatInject_1 = require("../../inject/chatInject");
const checkRoleBaseMiddleware_1 = require("../../../adapters/middlewares/checkRoleBaseMiddleware");
class clientRoute {
    constructor() {
        this.clientRoute = (0, express_1.Router)();
        this.setRoute();
    }
    setRoute() {
        this.clientRoute.post('/signup', (req, res) => {
            clientInject_1.clientAuthenticationController.sendOtp(req, res);
        });
        this.clientRoute.post('/createAccount', (req, res) => {
            clientInject_1.clientAuthenticationController.register(req, res);
        });
        this.clientRoute.post('/resendOtp', (req, res) => {
            clientInject_1.clientAuthenticationController.resendOtp(req, res);
        });
        this.clientRoute.post('/login', (req, res) => {
            clientInject_1.injectedClientLoginController.handleLogin(req, res);
        });
        this.clientRoute.post('/sendForgotPassword', (req, res) => {
            clientInject_1.injectedForgotPasswordClientController.handleSendResetEmail(req, res);
        });
        this.clientRoute.post('/forgotPassword', (req, res) => {
            clientInject_1.injectedForgotPasswordClientController.handleResetPassword(req, res);
        });
        this.clientRoute.post('/googleLogin', (req, res) => {
            clientInject_1.injectedClientLoginController.handleGoogleLogin(req, res);
        });
        this.clientRoute.patch('/changePassword', (req, res) => {
            clientInject_1.injectedProfileClientController.handeChangePasswordClient(req, res);
        });
        this.clientRoute.put('/updateProfile', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('client'), serviceInject_1.injectedClientStatusCheckingMiddleware, (req, res) => {
            clientInject_1.injectedProfileClientController.handleUpdateProfileClient(req, res);
        });
        this.clientRoute.get('/events/:pageNo', (req, res) => {
            clientInject_1.injectedEventClientController.handleFindAllEventsClient(req, res);
        });
        this.clientRoute.get('/findEvent/:eventId', (req, res) => {
            clientInject_1.injectedEventClientController.handleFindEventById(req, res);
        });
        this.clientRoute.post('/createTicket', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('client'), serviceInject_1.injectedClientStatusCheckingMiddleware, (req, res) => {
            clientInject_1.injectedTicketClientController.handleCreateUseCase(req, res);
        });
        this.clientRoute.post('/confirmTicket', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('client'), serviceInject_1.injectedClientStatusCheckingMiddleware, (req, res) => {
            clientInject_1.injectedTicketClientController.handleConfirmTicketAndPayment(req, res);
        });
        this.clientRoute.get('/events/search', (req, res) => {
            clientInject_1.injectedEventClientController.handleSearchEvents(req, res);
        });
        this.clientRoute.get('/eventsNearToUse/:latitude/:longitude/:pageNo/:range', (req, res) => {
            clientInject_1.injectedEventClientController.handleEventsNearToUse(req, res);
        });
        this.clientRoute.get('/bookings/:clientId/:pageNo', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('client'), serviceInject_1.injectedClientStatusCheckingMiddleware, (req, res) => {
            clientInject_1.injectedTicketClientController.handleFetchTicketAndEventDetails(req, res);
        });
        this.clientRoute.patch('/ticketCancel', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('client'), serviceInject_1.injectedClientStatusCheckingMiddleware, (req, res) => {
            clientInject_1.injectedTicketClientController.handleTicketCancel(req, res);
        });
        this.clientRoute.get('/wallet/:userId/:pageNo', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('client'), serviceInject_1.injectedClientStatusCheckingMiddleware, (req, res) => {
            clientInject_1.injectedWalletClientController.handleFindClientWallet(req, res);
        });
        this.clientRoute.get('/events/:category/:pageNo/:sortBy', (req, res) => {
            clientInject_1.injectedEventClientController.handleFindEventsBasedOnCategory(req, res);
        });
        this.clientRoute.post('/events/searchNearby', (req, res) => {
            clientInject_1.injectedEventClientController.handleEventsNearLocation(req, res);
        });
        this.clientRoute.get('/vendors', (req, res) => {
            clientInject_1.injectedVendorForClientController.handleFindVendorForClient(req, res);
        });
        this.clientRoute.get('/vendors/:vendorId/:PageNo', (req, res) => {
            clientInject_1.injectedVendorForClientController.handleFindVendorProfile(req, res);
        });
        this.clientRoute.get('/services', (req, res) => {
            clientInject_1.injectedServiceClientController.handleFindServiceForClient(req, res);
        });
        this.clientRoute.get('/servicesFiltering', (req, res) => {
            clientInject_1.injectedServiceClientController.handleFindServiceOnCategorybasis(req, res);
        });
        this.clientRoute.get('/service/search', (req, res) => {
            clientInject_1.injectedServiceClientController.handleSearchService(req, res);
        });
        this.clientRoute.get('/categories', (req, res) => {
            clientInject_1.injectedCategoryClientController.handleFindCategoryClient(req, res);
        });
        this.clientRoute.get('/showServiceWithVendor', (req, res) => {
            clientInject_1.injectedBookingClientController.handleShowServiceWithVendor(req, res);
        });
        this.clientRoute.post('/createBooking', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('client'), serviceInject_1.injectedClientStatusCheckingMiddleware, (req, res) => {
            clientInject_1.injectedBookingClientController.handleCreateBooking(req, res);
        });
        this.clientRoute.get('/showBookings/:clientId/:pageNo', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('client'), serviceInject_1.injectedClientStatusCheckingMiddleware, (req, res) => {
            clientInject_1.injectedBookingClientController.handleShowBookingsInClient(req, res);
        });
        this.clientRoute.post('/createBookingPayment', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('client'), serviceInject_1.injectedClientStatusCheckingMiddleware, (req, res) => {
            clientInject_1.injectedBookingClientController.handleCreateBookingPayment(req, res);
        });
        this.clientRoute.post('/confirmBookingPayment', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('client'), serviceInject_1.injectedClientStatusCheckingMiddleware, (req, res) => {
            clientInject_1.injectedBookingClientController.handleConfirmBookingPaymentUseCase(req, res);
        });
        this.clientRoute.patch('/cancelBooking', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('client'), serviceInject_1.injectedClientStatusCheckingMiddleware, (req, res) => {
            clientInject_1.injectedBookingClientController.handleCancelBooking(req, res);
        });
        this.clientRoute.get('/loadPreviousChat', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('client'), serviceInject_1.injectedClientStatusCheckingMiddleware, (req, res) => {
            chatInject_1.injectedLoadPreviousChatController.handleLoadPreviousMessage(req, res);
        });
        this.clientRoute.get('/chats', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('client'), serviceInject_1.injectedClientStatusCheckingMiddleware, (req, res) => {
            chatInject_1.injectedFindChatsOfUserController.handleFindChatOfUser(req, res);
        });
        this.clientRoute.post('/addReview', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('client'), serviceInject_1.injectedClientStatusCheckingMiddleware, (req, res) => {
            clientInject_1.injectedReviewController.handleAddReview(req, res);
        });
        this.clientRoute.get('/ticketByStatus/:ticketStatus/:paymentStatus/:pageNo/:sortBy', serviceInject_1.injectedVerifyTokenAndCheckBlacklistMiddleware, serviceInject_1.injectedTokenExpiryValidationChecking, (0, checkRoleBaseMiddleware_1.checkRoleBaseMiddleware)('client'), serviceInject_1.injectedClientStatusCheckingMiddleware, (req, res) => {
            clientInject_1.injectedTicketClientController.handleFindTicketsByStatus(req, res);
        });
    }
}
exports.clientRoute = clientRoute;
