/**
 * Alpaca Trading API Integration
 * Handles connection and trading with Alpaca Markets
 */

// Note: Using require for alpaca-trade-api due to its CommonJS nature
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Alpaca = require('@alpacahq/alpaca-trade-api');

export interface AlpacaConfig {
  keyId: string;
  secretKey: string;
  paper: boolean;
}

export interface AccountInfo {
  id: string;
  account_number: string;
  status: string;
  currency: string;
  cash: number;
  portfolio_value: number;
  buying_power: number;
  daytrading_buying_power: number;
  equity: number;
  last_equity: number;
  pattern_day_trader: boolean;
}

export interface Position {
  asset_id: string;
  symbol: string;
  exchange: string;
  asset_class: string;
  qty: number;
  side: string;
  market_value: number;
  cost_basis: number;
  unrealized_pl: number;
  unrealized_plpc: number;
  current_price: number;
}

export interface Order {
  id: string;
  client_order_id: string;
  status: string;
  symbol: string;
  side: string;
  type: string;
  qty: number;
  filled_qty: number;
  filled_avg_price: number | null;
  submitted_at: string;
  filled_at: string | null;
}

export interface OrderRequest {
  symbol: string;
  qty: number;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  time_in_force: 'day' | 'gtc' | 'opg' | 'ioc';
  limit_price?: number;
  stop_price?: number;
}

/**
 * Creates an Alpaca client instance
 */
export function createAlpacaClient(config: AlpacaConfig) {
  return new Alpaca({
    keyId: config.keyId,
    secretKey: config.secretKey,
    paper: config.paper,
  });
}

/**
 * Get account information
 */
export async function getAccountInfo(config: AlpacaConfig): Promise<AccountInfo> {
  const client = createAlpacaClient(config);
  const account = await client.getAccount();
  
  return {
    id: account.id,
    account_number: account.account_number,
    status: account.status,
    currency: account.currency,
    cash: parseFloat(account.cash),
    portfolio_value: parseFloat(account.portfolio_value),
    buying_power: parseFloat(account.buying_power),
    daytrading_buying_power: parseFloat(account.daytrading_buying_power),
    equity: parseFloat(account.equity),
    last_equity: parseFloat(account.last_equity),
    pattern_day_trader: account.pattern_day_trader,
  };
}

/**
 * Get all positions
 */
export async function getPositions(config: AlpacaConfig): Promise<Position[]> {
  const client = createAlpacaClient(config);
  const positions = await client.getPositions();
  
  return positions.map((pos: any) => ({
    asset_id: pos.asset_id,
    symbol: pos.symbol,
    exchange: pos.exchange,
    asset_class: pos.asset_class,
    qty: parseFloat(pos.qty),
    side: pos.side,
    market_value: parseFloat(pos.market_value),
    cost_basis: parseFloat(pos.cost_basis),
    unrealized_pl: parseFloat(pos.unrealized_pl),
    unrealized_plpc: parseFloat(pos.unrealized_plpc),
    current_price: parseFloat(pos.current_price),
  }));
}

/**
 * Submit an order
 */
export async function submitOrder(
  config: AlpacaConfig,
  order: OrderRequest
): Promise<Order> {
  const client = createAlpacaClient(config);
  
  const result = await client.createOrder({
    symbol: order.symbol,
    qty: order.qty.toString(),
    side: order.side,
    type: order.type,
    time_in_force: order.time_in_force,
    limit_price: order.limit_price?.toString(),
    stop_price: order.stop_price?.toString(),
  });
  
  return {
    id: result.id,
    client_order_id: result.client_order_id,
    status: result.status,
    symbol: result.symbol,
    side: result.side,
    type: result.type,
    qty: parseFloat(result.qty),
    filled_qty: parseFloat(result.filled_qty),
    filled_avg_price: result.filled_avg_price ? parseFloat(result.filled_avg_price) : null,
    submitted_at: result.submitted_at,
    filled_at: result.filled_at,
  };
}

/**
 * Get order by ID
 */
export async function getOrder(config: AlpacaConfig, orderId: string): Promise<Order> {
  const client = createAlpacaClient(config);
  const order = await client.getOrder(orderId);
  
  return {
    id: order.id,
    client_order_id: order.client_order_id,
    status: order.status,
    symbol: order.symbol,
    side: order.side,
    type: order.type,
    qty: parseFloat(order.qty),
    filled_qty: parseFloat(order.filled_qty),
    filled_avg_price: order.filled_avg_price ? parseFloat(order.filled_avg_price) : null,
    submitted_at: order.submitted_at,
    filled_at: order.filled_at,
  };
}

/**
 * Cancel an order
 */
export async function cancelOrder(config: AlpacaConfig, orderId: string): Promise<void> {
  const client = createAlpacaClient(config);
  await client.cancelOrder(orderId);
}

/**
 * Validate API credentials by attempting to fetch account info
 */
export async function validateCredentials(config: AlpacaConfig): Promise<boolean> {
  try {
    await getAccountInfo(config);
    return true;
  } catch {
    return false;
  }
}
