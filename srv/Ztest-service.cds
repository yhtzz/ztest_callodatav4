using {  ztest_13509_001 as ztest001 } from '../srv/external/ztest_13509_001';
@path: 'service/Sales'
service ZtestService {
  entity ztestodatav4Set as projection on ztest001.ztestodatav4Set;
  entity ztest { matnrstr:String };
  entity gettoken{access_token:String};
}
