"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var fs_1 = require("fs");
var path_1 = tslib_1.__importDefault(require("path"));
var chalk_1 = tslib_1.__importDefault(require("chalk"));
var utils_1 = require("./utils");
var entity_1 = tslib_1.__importDefault(require("./model/entity"));
var dto_1 = tslib_1.__importDefault(require("./model/dto"));
var serviceFace_1 = tslib_1.__importDefault(require("./model/serviceFace"));
var repository_1 = tslib_1.__importDefault(require("./api/repository"));
var service_1 = tslib_1.__importDefault(require("./api/service"));
var service_impl_1 = tslib_1.__importDefault(require("./api/service-impl"));
var controller_1 = tslib_1.__importDefault(require("./api/controller"));
exports.default = (function (config) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var outDir, _a, name, description, importCode, entityCode, dtoCode, serviceFaceCode, repositoryCode, serviceCode, serviceImplCode, controllerCode, modelDir, apiDir;
    return tslib_1.__generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                // 强制给实体字段加上 id 和 createTime列
                config.entity.columns = tslib_1.__spreadArrays([
                    {
                        name: "id",
                        type: "Long",
                        desc: "id",
                    },
                    {
                        name: "createTime",
                        type: "Date",
                        desc: "创建时间",
                    }
                ], config.entity.columns);
                outDir = path_1.default.resolve(fs_1.realpathSync(process.cwd()), "./dist");
                _a = config.entity, name = _a.name, description = _a.description;
                console.log(chalk_1.default.white("============= " + name + "(" + description + ") ============= "));
                importCode = utils_1.extractTypeImport(config);
                entityCode = utils_1.insetImportCode(entity_1.default(config), importCode);
                console.log(chalk_1.default.blue("* Create Entity"));
                dtoCode = dto_1.default(config);
                console.log(chalk_1.default.blue("* Create Dto"));
                serviceFaceCode = serviceFace_1.default(config);
                console.log(chalk_1.default.blue("* Create ServiceFace"));
                repositoryCode = repository_1.default(config);
                console.log(chalk_1.default.green("* Create Repository"));
                serviceCode = service_1.default(config);
                console.log(chalk_1.default.green("* Create Service"));
                serviceImplCode = service_impl_1.default(config);
                console.log(chalk_1.default.green("* Create ServiceImpl"));
                controllerCode = controller_1.default(config);
                console.log(chalk_1.default.green("* Create Controller"));
                console.log(chalk_1.default.cyan("----> 开始写入文件"));
                modelDir = path_1.default.join(outDir, "model");
                return [4 /*yield*/, codeToFile(path_1.default.join(modelDir, "./entity/" + name + ".java"), entityCode)];
            case 1:
                _b.sent();
                return [4 /*yield*/, codeToFile(path_1.default.join(modelDir, "./dto/" + name + "Dto.java"), dtoCode)];
            case 2:
                _b.sent();
                return [4 /*yield*/, codeToFile(path_1.default.join(modelDir, "./service/" + name + "ServiceFace.java"), serviceFaceCode)];
            case 3:
                _b.sent();
                apiDir = path_1.default.join(outDir, "api");
                return [4 /*yield*/, codeToFile(path_1.default.join(apiDir, "./repository/" + name + "Repository.java"), repositoryCode)];
            case 4:
                _b.sent();
                return [4 /*yield*/, codeToFile(path_1.default.join(apiDir, "./service/" + name + "Service.java"), serviceCode)];
            case 5:
                _b.sent();
                return [4 /*yield*/, codeToFile(path_1.default.join(apiDir, "./service/impl/" + name + "ServiceImpl.java"), serviceImplCode)];
            case 6:
                _b.sent();
                return [4 /*yield*/, codeToFile(path_1.default.join(apiDir, "./controller/" + name + "Controller.java"), controllerCode)];
            case 7:
                _b.sent();
                console.log(chalk_1.default.cyan("----> 开始完毕"));
                return [2 /*return*/, Promise.resolve()];
        }
    });
}); });
/**
 * 写入文件
 * @param file 文件路径
 * @param code 代码
 */
function codeToFile(file, code) {
    console.log("Create File ", file);
    utils_1.mkdirs(path_1.default.dirname(file));
    return fs_1.promises.writeFile(file, code, { encoding: "utf-8" });
}
exports.codeToFile = codeToFile;
