const AWS = require("aws-sdk");

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    let body;
    let statusCode = 200;
    const headers = {
        "Content-Type": "application/json"
    };
  
  
  let requestJSON;

    try {
        switch (event.routeKey) {
            
            case "POST /items":
                requestJSON = JSON.parse(event.body);
                await dynamo
                    .put({
                        TableName: "Product",
                        Item: {
                            Id: requestJSON.id,
                            price: requestJSON.price,
                            name: requestJSON.name
                        }
                    })
                    .promise();
                body = `Put item ${requestJSON.id}`;
            break;
            
            case "DELETE /items/{id}":
                console.log(event.pathParameters.id)
                await dynamo
                    .delete({
                        TableName: "Product",
                        Key: {
                            Id: event.pathParameters.id
                        }
                    })
                    .promise();
                body = `Deleted item ${event.pathParameters.id}`;
            break;
          
            case "GET /items/{id}":
                body = await dynamo
                  .get({
                    TableName: "Product",
                    Key: {
                      Id: event.pathParameters.id
                    }
                  })
                  .promise();
            break;
          
            case "GET /items":
                body = await dynamo.scan({ TableName: "Product" }).promise();
            break;
          
            case "PUT /items/{id}":
                requestJSON = JSON.parse(event.body);
                await dynamo
                    .update({
                        TableName: "Product",
                        Key: {
                            Id: event.pathParameters.id
                        },
                        UpdateExpression: 'set price = :r',
                        ExpressionAttributeValues: {
                            ':r': requestJSON.price,
                        },
                    })
                    .promise();
                body = `Put item ${event.pathParameters.id}`;
            break;
        
        default:
            throw new Error(`Unsupported route: "${event.routeKey}"`);
    }
    } catch (err) {
        statusCode = 400;
        body = err.message;
    } finally {
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers
    };
};