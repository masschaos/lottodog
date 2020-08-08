/* eslint-disable no-unused-vars */
// genereate json schema file from openapi schema

const fs = require('fs')
const path = require('path')
const toJsonSchema = require('@openapi-contrib/openapi-schema-to-json-schema')

const openapiSchema = require('../../docs/openapi')

// convert to json schema
const openapiJson = toJsonSchema(openapiSchema)

// convert required
const processRequired = (schema) => {
  if (schema.properties) {
    const requiredFields = schema.required || []
    const properties = Object.keys(schema.properties)
    for (const propName of properties) {
      const prop = schema.properties[propName]
      if (prop.required === true) {
        requiredFields.push(propName)
        delete prop.required
      }

      if (prop.properties) {
        processRequired(prop)
      }
    }

    if (requiredFields.length > 0) {
      schema.required = requiredFields
    }
  }
}

/*
const componentNames = Object.keys(openapiJson.components.schemas)
for (const name of componentNames) {
  const schema = openapiJson.components.schemas[name]
  processRequired(schema)
}
*/

// save to file
const targetFile = path.join(__dirname, '../jobs/schema', 'lotto-api.json')
fs.writeFileSync(targetFile, JSON.stringify(openapiJson, null, 2), { encoding: 'utf-8' })

console.log('DONE!')
