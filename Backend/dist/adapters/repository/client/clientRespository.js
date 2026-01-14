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
exports.clientRepository = void 0;
const clientModel_1 = require("../../../framework/database/models/clientModel");
class clientRepository {
    createClient(client) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield clientModel_1.ClientModel.create(client);
        });
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield clientModel_1.ClientModel.findOne({ email: email });
        });
    }
    resetPassword(clientId, password) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield clientModel_1.ClientModel.findOneAndUpdate({ clientId }, { password }, { new: true });
        });
    }
    googleLogin(client) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield clientModel_1.ClientModel.create(client);
        });
    }
    blockUser(clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const blockedUser = yield clientModel_1.ClientModel.findByIdAndUpdate(clientId, { status: 'block' }, { new: true }).select('status');
            return (blockedUser === null || blockedUser === void 0 ? void 0 : blockedUser.status) || null;
        });
    }
    unBlockUser(clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const unBlockedUser = yield clientModel_1.ClientModel.findByIdAndUpdate(clientId, { status: 'active' }, { new: true }).select('status');
            return (unBlockedUser === null || unBlockedUser === void 0 ? void 0 : unBlockedUser.status) || null;
        });
    }
    findAllClients(pageNo) {
        return __awaiter(this, void 0, void 0, function* () {
            const limit = 5;
            const page = Math.max(pageNo, 1);
            const skip = (page - 1) * limit;
            const clients = yield clientModel_1.ClientModel.find({ isAdmin: false }).select('-password').skip(skip).limit(limit);
            const totalPages = Math.ceil((yield clientModel_1.ClientModel.countDocuments()) / limit);
            return { clients, totalPages };
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield clientModel_1.ClientModel.findById(id);
        });
    }
    changeProfileImage(clientId, profileImage) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield clientModel_1.ClientModel.findByIdAndUpdate(clientId, { profileImage });
        });
    }
    showProfileDetails(cliendId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield clientModel_1.ClientModel.findOne({ status: 'active', _id: cliendId }).select('name email phone profileImage');
        });
    }
    updateProfile(client) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield clientModel_1.ClientModel.findByIdAndUpdate(client._id, { name: client.name, phone: client.phone, profileImage: client.profileImage }, { new: true }).select('_id clientId email name phone profileImage role stat');
        });
    }
    findPassword(clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield clientModel_1.ClientModel.findById(clientId).select('password');
            return (client === null || client === void 0 ? void 0 : client.password) || null;
        });
    }
    changePassword(clientId, password) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield clientModel_1.ClientModel.findByIdAndUpdate(clientId, { password }, { new: true });
        });
    }
    findStatusForMiddleware(clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield clientModel_1.ClientModel.findById(clientId).select('status');
            if (!client)
                throw new Error('No clint found in this ID');
            return client.status;
        });
    }
    searchClients(search) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = { isAdmin: false };
            if (search) {
                const orConditions = [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ];
                const phoneNumber = parseInt(search, 10);
                if (!isNaN(phoneNumber)) {
                    orConditions.push({ phone: phoneNumber });
                }
                orConditions.push({
                    $expr: {
                        $regexMatch: {
                            input: { $toString: "$phone" },
                            regex: search,
                            options: "i"
                        }
                    }
                });
                query.$or = orConditions;
            }
            const clients = yield clientModel_1.ClientModel.find(query)
                .select('-password');
            return clients;
        });
    }
    totalClient() {
        return __awaiter(this, void 0, void 0, function* () {
            return clientModel_1.ClientModel.countDocuments();
        });
    }
}
exports.clientRepository = clientRepository;
