// Network utility functions for handling VPN and connectivity issues

export const isWebSocketSupported = (): boolean => {
  return typeof WebSocket !== 'undefined';
};

export const testWebSocketConnection = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!isWebSocketSupported()) {
      resolve(false);
      return;
    }

    try {
      // Test WebSocket connection to Supabase
      const ws = new WebSocket('wss://htgkddahhgugesktujds.supabase.co/realtime/v1/websocket');
      
      const timeout = setTimeout(() => {
        ws.close();
        resolve(false);
      }, 3000); // 3 second timeout

      ws.onopen = () => {
        clearTimeout(timeout);
        ws.close();
        resolve(true);
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };

      ws.onclose = () => {
        clearTimeout(timeout);
      };
    } catch {
      resolve(false);
    }
  });
};

export const shouldUseRealtime = async (): Promise<boolean> => {
  // Check if WebSocket is supported and can connect
  const wsSupported = isWebSocketSupported();
  if (!wsSupported) {
    return false;
  }

  // Test connection
  const canConnect = await testWebSocketConnection();
  return canConnect;
};

export const getNetworkStatus = () => {
  // Check for common VPN indicators
  const userAgent = navigator.userAgent.toLowerCase();
  const isVPN = userAgent.includes('vpn') || 
                userAgent.includes('proxy') ||
                userAgent.includes('tunnel');
  
  return {
    isVPN,
    userAgent,
    webSocketSupported: isWebSocketSupported()
  };
};
