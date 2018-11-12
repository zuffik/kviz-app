import {API_DEBUG, API_URL} from 'react-native-dotenv';
import {createHttpLink} from "apollo-link-http";
import {ApolloClient, ApolloQueryResult, QueryOptions, OperationVariables, ApolloClientOptions} from "apollo-client";
import {InMemoryCache} from "apollo-cache-inmemory";
import gqlTag from 'graphql-tag';

export interface ClientProps {
  baseUrl: string;
  authToken?: string;
  tokenType?: 'Basic' | 'Bearer';
  headers?: { [key: string]: string };
  debug?: boolean;
}

export interface HttpInterface {
  get(url: string, overrideHeaders?: HeaderBag): Promise<Response>;

  delete(url: string, overrideHeaders?: HeaderBag): Promise<Response>;

  head(url: string, overrideHeaders?: HeaderBag): Promise<Response>;

  post(url: string, data: any, overrideHeaders?: HeaderBag): Promise<Response>;

  put(url: string, data: any, overrideHeaders?: HeaderBag): Promise<Response>;

  patch(url: string, data: any, overrideHeaders?: HeaderBag): Promise<Response>;
}

interface HeaderBag {
  [key: string]: string;
}

class Client implements ClientProps, HttpInterface {
  authToken?: string;
  baseUrl: string;
  tokenType?: "Basic" | "Bearer";
  headers?: HeaderBag;
  debug?: boolean;

  constructor(props: ClientProps) {
    this.authToken = props.authToken;
    this.tokenType = props.tokenType;
    this.baseUrl = props.baseUrl;
    this.headers = props.headers;
    this.debug = props.debug;
  }

  private getHeaders(override?: HeaderBag) {
    return {
      ...this.headers,
      Authorization: `${this.tokenType}: ${this.authToken}`,
      ...(override || {})
    };
  }

  private nonBodyRequest(url: string, method: 'DELETE' | 'GET' | 'HEAD', overrideHeaders?: HeaderBag) {
    return this.doRequest(url, method, undefined, overrideHeaders);
  }

  private bodyRequest(url: string, method: 'POST' | 'PUT' | 'PATCH', data: any, overrideHeaders?: HeaderBag) {
    return this.doRequest(url, method, JSON.stringify(data), overrideHeaders);
  }

  private doRequest(url: string, method: string, data?: string, overrideHeaders?: HeaderBag) {
    if (this.debug) {
      console.log(`${method}-ing '${data || ''}' ${data ? 'to' : 'from'} '${this.baseUrl + url}'`);
      console.log(this.baseUrl + url, {
        method,
        headers: this.getHeaders(overrideHeaders),
        body: data
      });
    }
    return new Promise<Response>((rsl, rej) => {
      fetch(this.baseUrl + url, {
        method,
        headers: this.getHeaders(overrideHeaders),
        body: data
      }).then((response: Response) => {
        if (this.debug) {
          console.log(response);
        }
        rsl(response);
      }).catch((err) => {
        if (this.debug) {
          console.log();
          console.log(err.message);
          console.log(err.stack);
          console.log(err);
        }
        rej(err);
      });
    });
  }

  delete(url: string, overrideHeaders?: HeaderBag): Promise<Response> {
    return this.nonBodyRequest(url, 'DELETE', overrideHeaders);
  }

  get(url: string, overrideHeaders?: HeaderBag): Promise<Response> {
    return this.nonBodyRequest(url, 'GET', overrideHeaders);
  }

  head(url: string, overrideHeaders?: HeaderBag): Promise<Response> {
    return this.nonBodyRequest(url, 'HEAD', overrideHeaders);
  }

  patch(url: string, data: any, overrideHeaders?: HeaderBag): Promise<Response> {
    return this.bodyRequest(url, 'PATCH', data, overrideHeaders);
  }

  post(url: string, data: any, overrideHeaders?: HeaderBag): Promise<Response> {
    return this.bodyRequest(url, 'POST', data, overrideHeaders);
  }

  put(url: string, data: any, overrideHeaders?: HeaderBag): Promise<Response> {
    return this.bodyRequest(url, 'PUT', data, overrideHeaders);
  }
}

const graphqlEndpoint = API_URL + '/graphql';

export const gql = (literals: any, ...placeholders: any[]): any => {
  const result: ApolloDocumentNode = gqlTag(literals, ...placeholders);
  result.query = literals;
  return result;
};

interface ApolloDocumentNode {
  query: string;
}

interface ApolloQueryOptions<TVars> extends QueryOptions<TVars> {
  query: ApolloDocumentNode;
}

class Apollo<Cache> extends ApolloClient<Cache> {
  private readonly debug?: boolean;
  private readonly endpoint: string;

  constructor(options: ApolloClientOptions<Cache>, debug?: boolean) {
    super(options);
    this.debug = debug;
    this.endpoint = graphqlEndpoint;
  }

  query<T, TVariables = OperationVariables>(options: ApolloQueryOptions<TVariables>): Promise<ApolloQueryResult<T>> {
    if (this.debug) {
      console.log(`Querying ${this.endpoint} for ${options.query.query}`);
    }
    return super.query(options);
  }
}

const link = createHttpLink({uri: graphqlEndpoint});
export const apolloClient = new Apollo({
  link,
  cache: new InMemoryCache()
}, API_DEBUG);

export const httpClient = new Client({
  baseUrl: API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  debug: API_DEBUG
});
