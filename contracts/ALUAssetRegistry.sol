// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ALUAssetRegistry
 * @dev Registers the official ALU logo as a unique ERC-721 digital asset.
 * The contract stores a SHA-256 fingerprint of the file so anyone can verify
 * whether a logo file matches the official registered version.
 */
contract ALUAssetRegistry is ERC721, Ownable {
    struct AssetMetadata {
        string assetName;
        string fileType;
        bytes32 contentHash;
        address registeredBy;
        uint256 registeredAt;
    }

    uint256 private _nextTokenId;

    mapping(uint256 => AssetMetadata) private _assetMetadata;
    mapping(bytes32 => bool) public registeredContentHashes;

    event AssetRegistered(
        uint256 indexed tokenId,
        string assetName,
        string fileType,
        bytes32 indexed contentHash,
        address indexed registeredBy,
        uint256 registeredAt
    );

    constructor() ERC721("ALU Asset Registry", "ALUAR") Ownable(msg.sender) {}

    /**
     * @notice Registers a new digital asset and mints an NFT to the caller.
     * @param assetName Human-readable name of the asset.
     * @param fileType File type, for example image/png.
     * @param contentHash SHA-256 hash of the asset file as bytes32.
     * @return tokenId The ERC-721 token ID assigned to the registered asset.
     */
    function registerAsset(
        string memory assetName,
        string memory fileType,
        bytes32 contentHash
    ) public returns (uint256 tokenId) {
        require(contentHash != bytes32(0), "Invalid content hash");
        require(
            !registeredContentHashes[contentHash],
            "Asset with this content hash already registered"
        );

        _nextTokenId += 1;
        tokenId = _nextTokenId;

        _safeMint(msg.sender, tokenId);

        _assetMetadata[tokenId] = AssetMetadata({
            assetName: assetName,
            fileType: fileType,
            contentHash: contentHash,
            registeredBy: msg.sender,
            registeredAt: block.timestamp
        });

        registeredContentHashes[contentHash] = true;

        emit AssetRegistered(
            tokenId,
            assetName,
            fileType,
            contentHash,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @notice Checks whether a supplied hash matches the stored logo hash.
     * @dev This is a view function, so it only reads blockchain state and costs no gas
     * when called off-chain.
     */
    function verifyLogoIntegrity(
        uint256 tokenId,
        bytes32 suppliedHash
    ) public view returns (bool, string memory) {
        require(_ownerOf(tokenId) != address(0), "Asset does not exist");

        if (_assetMetadata[tokenId].contentHash == suppliedHash) {
            return (true, "Logo is authentic.");
        }

        return (false, "Warning: logo does not match.");
    }

    /**
     * @notice Returns the full metadata stored for a registered asset.
     */
    function getAsset(uint256 tokenId) public view returns (AssetMetadata memory) {
        require(_ownerOf(tokenId) != address(0), "Asset does not exist");
        return _assetMetadata[tokenId];
    }
}
