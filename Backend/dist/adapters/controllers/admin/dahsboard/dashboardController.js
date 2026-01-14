"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardAdminController = void 0;
const httpStatus_1 = require("../../../../domain/enums/httpStatus");
const messages_1 = require("../../../../domain/enums/messages");
class DashboardAdminController {
    constructor(adminDashBoardUseCase, eventGraphUseCase) {
        this.adminDashBoardUseCase = adminDashBoardUseCase;
        this.eventGraphUseCase = eventGraphUseCase;
    }
    handleAdminDashboardata(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { adminId } = req.query;
                const eventDetailsForGraph = yield this.eventGraphUseCase.eventGraphDetails();
                const { bookings, events, totalBookings, totalClients, totalRevenue, totalVendors } = yield this.adminDashBoardUseCase.dashBoardDetails(adminId);
                res.status(httpStatus_1.HttpStatus.OK).json({ message: messages_1.Messages.DASHBOARD_DATA_FETCHED, bookings, events, totalBookings, totalClients, totalRevenue, totalVendors, eventDetailsForGraph });
            }
            catch (error) {
                //console.log('error while fetching admin dashboard data', error)
                res.status(httpStatus_1.HttpStatus.BAD_REQUEST).json({
                    message: messages_1.Messages.DASHBOARD_DATA_ERROR,
                    error: error instanceof Error ? error.message : messages_1.Messages.DASHBOARD_DATA_ERROR
                });
            }
        });
    }
}
exports.DashboardAdminController = DashboardAdminController;
