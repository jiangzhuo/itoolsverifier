(function () {
    var itoolsverifier;
    var http = require('http');
//    var StructType = require('reified')
    var ursa = require('ursa')
    var fs = require('fs')

    itoolsverifier = (function () {
        function itoolsverifier(pub_key_path) {
            // 解密用的公鑰
            this.pub_key = fs.readFileSync(pub_key_path)
        }

//
//        itoolsverifier.prototype.verifyLogin = function (data, cb) {
//            if (Buffer.isBuffer(data)) {
//                // TODO 二進制協議是舊格式的數據，等以後再考慮是否支持，第一版本先寫好json格式的
//                // 二進制格式的數據
////                var token = StructType.CharType(16).typeDef('token');
////                var binaryLoginData = new StructType('binaryLoginData', {len: 'Uint32', command: 'Uint32', token_key: token})
////                var loginData = new binaryLoginData(data)
////                console.log(loginData.reify())
//            } else if (typeof data == "string") {
//                // json格式的數據
//                var options = {
//                    hostname: 'passport_i.25pp.com',
//                    port: 8080,
//                    path: '/index?tunnel-command=2852126756',
//                    method: 'POST',
//                    headers: {'Content-Length': 32}
//                };
//                var req = http.request(options, function (res) {
////                    res.setEncoding('hex');
//                    res.on('data', function (chunk) {
//                        var result = JSON.parse("{" + chunk + "}")
//                        cb(null, result)
//                    });
//                });
//
//                // post the data
//                req.write(data);
//                req.on('error', function (e) {
//                    cb(e, null)
//                });
//                req.end();
//            } else {
//                cb(new Error('wrong token format'))
//            }
//        }


        itoolsverifier.prototype.verifyBill = function (data, cb) {
            try {
                var notifyData = data.notify_data
                var sign = data.sign
                // 先base64 decode
                var decodeResult = (new Buffer(notifyData, 'base64'))
                var maxLength = 128
                console.error('decodeResult is ', decodeResult)
                // 再進行RSA解密
                var key = ursa.createPublicKey(this.pub_key);
                var output = ''
                while (decodeResult.length != 0) {
                    var input = decodeResult.slice(0, maxLength)
                    output += key.publicDecrypt(input).toString('utf8')
                    console.error('output is ', output)
                    decodeResult = decodeResult.slice(maxLength)
                    console.error(decodeResult.length)
                }
                notifyData = JSON.parse(output);
                 try{
                    console.log(key.verify('sha256', output, (new Buffer(sign, 'base64'))))
                }catch (e){

                }

                try{
                    console.log(key.verify('md5', output, (new Buffer(sign, 'base64'))))
                }catch (e){

                }
                
                try{
                    console.log(key.verify('SHA1WithRSA', output, (new Buffer(sign, 'base64'))))
                }catch (e){

                }

                var verifyResult = true
//                data.sign_decrypted = decryptResult
                cb(null, {decrypt_result: notifyData, verify_result: verifyResult})
            } catch (e) {
                cb(e, false)
            }
        };

        return itoolsverifier;

    })();

    module.exports = itoolsverifier;

}).call(this);