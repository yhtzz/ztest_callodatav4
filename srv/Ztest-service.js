
const cds = require('@sap/cds');
const { Console } = require('console');
//const { query } = require('express');

/**
 * Implementation for Risk Management service defined in ./risk-service.cds
 */
module.exports = cds.service.impl(async function () {
  //外部api
  const ztest001 = await cds.connect.to('ztest_13509_001');

  //const fs = require('fs');
  //fs.writeFileSync('./default-env.json', process.env.VCAP_SERVICES);
  /*let cfConfig = JSON.parse(process.env.VCAP_SERVICES || "{}")
  console.log(cfConfig)
  const cfConfig1 = JSON.parse(process.env.VCAP_SERVICES || "{}")
  console.log(cfConfig1)
  const cc1 = cfConfig1.connectivity[0].credentials
  console.log(cc1)*/
  //console.log( process.env.CDS_ENV)

 // console.log( cds.env.features.fetch_csrf )
  if (process.env.CDS_ENV == 'hybrid') {
    const fs = require('fs');
    fs.readFile('default-env.json', 'utf8', (err, vcapservicejson) => {
      if (err) {
        console.error('Error reading the file:', err);
      }
      process.env.VCAP_SERVICES = vcapservicejson
    });

  }
  //外部api entity 名称
  const matnrs = 'ztestodatav4Set';//'ZtestService.ztestodatav4Set';

  this.on('READ', 'ztestodatav4Set', async req => {

    //自定义查询条件
    let query = new cds.ql.query(SELECT.columns(['Matnr', 'Maktx']).from(matnrs));//('ZtestService.ztestodatav4Set'));

    //传入的查询条件
    //  query = req.query
    try {
      //  同步调用
      let response = await ztest001.run(query);
      return response;
    } catch (error) {
      //处理异常返回
      req.error(error);
      return req;
    }


  });

  this.on('CREATE', 'ztestodatav4Set', async (req) => {
    //传入Query
    let query = req.query;
    //自定义Query
    let matnr = {};
    matnr.Matnr = Math.random().toString();
    matnr.Maktx = new Date().getTime().toString();
    query = new cds.ql.query(INSERT(matnr).into(matnrs));

    try {
      //  同步调用
      let response = await ztest001.run(query);
      return response;
    } catch (error) {
      //处理异常返回
      req.error(error);
      return req;
    }
  });
  this.on('READ', 'ztest', async req => {
    //自定义查询条件
    let query = new cds.ql.query();//('ZtestService.ztestodatav4Set'));

    try {
      //  同步调用
      let response = await ztest001.run(query);
      //遍历结果
      response.forEach(result => {
        result.matnrstr = result.Matnr + '-' + result.Maktx;
      });

      return response;
    } catch (error) {
      //处理异常返回
      // error.statusCode = 500;
      req.error(error);
      return req;
    }
  });
  this.on('READ', 'gettoken', async (req, next) => {

    const results = await next();
    const axios = require('axios');
    const querystring = require('querystring');

    // 配置要发送的数据
    const data = querystring.stringify({
      client_id: 'sb-ztest_callodatav4-201e15d7trial-dev!t49064',
      client_secret: 'b803b23f-eec1-45c6-a43a-88519705f87f$q2eeHzxZcOB2miCO9gZpdGyH405Fl2D-XWXrA6DKDvw=',
      grant_type: 'client_credentials',
      response_type: 'token'
      // 其他必要的参数
    });

    // 设置请求头，告知服务器内容类型
    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    // 发送POST请求
    await axios.post('https://201e15d7trial.authentication.ap21.hana.ondemand.com/oauth/token', data, config)
      .then(response => {
        // 处理响应，获取token
        const token = response.data.access_token;
        console.log('Token:', token);
        results.push(response.data);
        return results;
      })
      .catch(error => {
        console.error('Error:', error);
        req.error(error);
        return req;
      });
  });
});