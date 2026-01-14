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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpService = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
class OtpService {
    constructor() {
        this.cache = new node_cache_1.default({ stdTTL: 300 });
    }
    generateOtp() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    storeOtp(email, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            this.cache.set(email, otp, 300);
        });
    }
    verifyOtp(email, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            const storedOtp = this.cache.get(email);
            if (!storedOtp || storedOtp != otp) {
                return false;
            }
            this.cache.del(email);
            return true;
        });
    }
}
exports.OtpService = OtpService;
