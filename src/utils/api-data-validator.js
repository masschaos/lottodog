/**
 * Lotto watch dog
 *
 * create: 2020/08/08
 **/
const Ajv = require('ajv')
const fs = require('fs')
const path = require('path')

/**
 * 根据 openapi schema 定义验证 api 结果信息
 */
class ApiDataValidator {
  constructor(openapiFile) {
    const JSONSchemaDraft4Definition = require('ajv/lib/refs/json-schema-draft-04.json')
    const ajv = new Ajv({
      schemaId: 'id', // draft-04 support requirement
      allErrors: true,
      jsonPointers: true,
      nullable: true,
      unknownFormats: ['int32'],
    })

    // add the schema to the instance.
    ajv.addMetaSchema(JSONSchemaDraft4Definition)
    ajv.addSchema(openapiFile, 'id')

    this._ajv = ajv
  }

  validate(schema, listData, idField = 'id') {
    const validate = this._ajv.getSchema(schema)
    const results = []

    let failedCount = 0
    for (const row of listData) {
      const valid = validate(row)
      if (!valid) {
        results.push({ [idField]: row[idField], result: validate.errors })
        failedCount++
      }
    }

    return {
      err: null,
      total: listData.length,
      failed: failedCount,
      result: results,
    }
  }

  saveResult(result, file) {
    const resultPath = path.dirname(file)
    if (!fs.existsSync(resultPath)) {
      fs.mkdirSync(resultPath, { recursive: true })
    }

    fs.writeFileSync(file, JSON.stringify(result, null, 2), { encoding: 'utf-8' })
  }
}

module.exports = ApiDataValidator
