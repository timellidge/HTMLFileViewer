#!/usr/bin/env sh

m365 spo app add --appCatalogUrl https://trinder365dev.sharepoint.com/sites/appcatalog --filePath sharepoint/solution/content-query.sppkg --overwrite

m365 spo app deploy --name content-query.sppkg --appCatalogUrl https://trinder365dev.sharepoint.com/sites/appcatalog 

m365 spo app upgrade --id a0979786-b8d7-4582-bb91-6d27b963f6e4 --siteUrl https://trinder365dev.sharepoint.com/sites/MockData