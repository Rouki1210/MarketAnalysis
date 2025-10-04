using MarketAnalysisBackend.Models;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace MarketAnalysisBackend.Hubs
{
    public class PriceHub : Hub
    {
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
        }
        // Khi client muốn rời group
        public async Task LeaveAssetGroup(string asset)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, asset);
            await Clients.Caller.SendAsync("left_group", asset);
        }
    }
}
