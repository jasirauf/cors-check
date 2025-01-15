import { Button, Form, Input, Select, message } from 'antd'; // Update import
import React, { useState } from 'react';
const { Option } = Select;

const ApiRequestForm = () => {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState('');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [curlCommand, setCurlCommand] = useState('');

  // Function to parse cURL command
  const parseCurl = (curl) => {
    const urlRegex = /curl\s+'(https?:\/\/[^\s]+)'/;
    const methodRegex = /-X\s'(\w+)'/;
    const headerRegex = /-H\s'([^']+)'/g;
    const bodyRegex = /--data-raw\s'([^']+)'/;

    // Extract URL
    const urlMatch = curl.match(urlRegex);
    const methodMatch = curl.match(methodRegex);
    const headersMatch = [...curl.matchAll(headerRegex)];
    const bodyMatch = curl.match(bodyRegex);

    if (urlMatch) {
      setUrl(urlMatch[1]);
    }
    if (methodMatch) {
      setMethod(methodMatch[1]);
    }
    if (headersMatch) {
      const parsedHeaders = headersMatch.map(match => match[1]);
      setHeaders(parsedHeaders.join('\n')); // Join headers as a plain string
    }
    if (bodyMatch) {
      setBody(bodyMatch[1]);
    }
  };

  // Function to convert plain header string into JSON object
  const parseHeaders = (headersStr) => {
    const headersArr = headersStr.split('\n').map(header => {
      const [key, value] = header.split(':').map(str => str.trim());
      return [key, value];
    });
    return Object.fromEntries(headersArr); // Convert array to object
  };

  const handleSubmit = () => {
    setLoading(true);

    let requestHeaders = {};
    try {
      requestHeaders = parseHeaders(headers); // Parse headers into an object
    } catch (error) {
      message.error('Invalid headers format');
      setLoading(false);
      return;
    }

    const requestBody = body ? JSON.parse(body) : null;

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...requestHeaders,
      },
      body: method !== 'GET' ? JSON.stringify(requestBody) : undefined,
    })
      .then((res) => res.json())
      .then((data) => {
        setResponse(data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        message.error(`Request failed: ${error.message}`);
      });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 border shadow-lg rounded-lg bg-white mt-14">
      <h2 className="text-2xl mb-4 text-center">API Cors check</h2>
      <Form layout="vertical">
        <Form.Item label="Enter cURL Command">
          <Input.TextArea
            value={curlCommand}
            onChange={(e) => setCurlCommand(e.target.value)}
            placeholder="Paste cURL command here"
            rows={4}
            size="large"
          />
          <Button
            type="primary"
            onClick={() => parseCurl(curlCommand)}
            size="large"
            className="mt-2"
          >
            Parse cURL
          </Button>
        </Form.Item>

        <Form.Item label="API URL">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter API URL"
            size="large"
          />
        </Form.Item>

        <Form.Item label="HTTP Method">
          <Select
            value={method}
            onChange={(value) => setMethod(value)}
            size="large"
          >
            <Option value="GET">GET</Option>
            <Option value="POST">POST</Option>
            <Option value="PUT">PUT</Option>
            <Option value="DELETE">DELETE</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Headers (JSON)">
          <Input.TextArea
            value={headers}
            onChange={(e) => setHeaders(e.target.value)}
            placeholder='{"Authorization": "Bearer token"}'
            rows={4}
            size="large"
          />
        </Form.Item>

        {(method === 'POST' || method === 'PUT') && (
          <Form.Item label="Body (JSON)">
            <Input.TextArea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder='{"key": "value"}'
              rows={4}
              size="large"
            />
          </Form.Item>
        )}

        <Button
          type="primary"
          onClick={handleSubmit}
          loading={loading}
          size="large"
          className="w-full"
        >
          Send Request
        </Button>
      </Form>

      {response && (
        <div className="mt-6">
          <h3 className="text-xl mb-2">Response:</h3>
          <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ApiRequestForm;
