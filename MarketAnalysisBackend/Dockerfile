# syntax=docker/dockerfile:1
ARG DOTNET_VERSION=8.0

FROM mcr.microsoft.com/dotnet/sdk:${DOTNET_VERSION} AS builder
WORKDIR /app

COPY --link MarketAnalysisBackend.csproj ./ 
RUN --mount=type=cache,target=/root/.nuget/packages \ 
	--mount=type=cache,target=/root/.cache/msbuild \ 
	dotnet restore "MarketAnalysisBackend.csproj"

# Đảm bảo có source nuget.org
RUN dotnet nuget remove source nuget.org || true
RUN dotnet nuget add source https://api.nuget.org/v3/index.json -n nuget.org

# Restore với no-cache
RUN dotnet restore "MarketAnalysisBackend.csproj" --no-cache

# Copy toàn bộ source code
COPY . ./


# Build & publish
RUN dotnet publish "MarketAnalysisBackend.csproj" -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:${DOTNET_VERSION} AS final
WORKDIR /app/publish

RUN useradd -m appuser
USER appuser

COPY --from=builder /app/publish .

EXPOSE 8080
EXPOSE 8081

ENTRYPOINT ["dotnet", "MarketAnalysisBackend.dll"]
