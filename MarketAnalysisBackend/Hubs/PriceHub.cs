using MarketAnalysisBackend.Models;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Threading.Tasks;

namespace MarketAnalysisBackend.Hubs
{
    public class PriceHub : Hub
    {
        private static readonly ConcurrentDictionary<string, HashSet<string>> _activeGroups = new();
        // Khi client kết nối
        public override async Task OnConnectedAsync()
        {
            await Clients.Caller.SendAsync("connected", "Welcome to PriceHub!");
            await base.OnConnectedAsync();
        }

        // Khi client muốn join vào group (theo symbol coin)
        public async Task JoinAssetGroup(string asset)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, asset);
            await Clients.Caller.SendAsync("joined_group", asset);

            _activeGroups.AddOrUpdate(
               asset,
               _ => new HashSet<string> { Context.ConnectionId },
               (_, set) => { set.Add(Context.ConnectionId); return set; }
           );
        }
        // Khi client muốn rời group
        public async Task LeaveAssetGroup(string asset)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, asset);
            await Clients.Caller.SendAsync("left_group", asset);

            if (_activeGroups.TryGetValue(asset, out var connections))
            {
                connections.Remove(Context.ConnectionId);
                if (connections.Count == 0)
                    _activeGroups.TryRemove(asset, out _);
            }
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            // Clean up user from all groups when they disconnect
            foreach (var group in _activeGroups)
            {
                if (group.Value.Remove(Context.ConnectionId) && group.Value.Count == 0)
                    _activeGroups.TryRemove(group.Key, out _);
            }

            await base.OnDisconnectedAsync(exception);
        }

        // 👇 Helper for background service
        public static IReadOnlyCollection<string> GetActiveAssetSymbols()
        {
            return _activeGroups.Keys.ToList();
        }
    }
}
