package com.asmsafone.zaptura.resources;

import static com.asmsafone.zaptura.http.Http.encodeSegment;

import com.asmsafone.zaptura.ZapturaClient;
import com.asmsafone.zaptura.http.HttpMethod;
import com.asmsafone.zaptura.model.SetProfileNameRequest;
import com.asmsafone.zaptura.model.SetProfilePictureRequest;
import com.asmsafone.zaptura.model.SetProfileStatusRequest;
import com.asmsafone.zaptura.model.SuccessResult;

/** Profile resource — the linked account's display name, status text and picture. */
public final class ProfileResource {
    private final ZapturaClient client;

    public ProfileResource(ZapturaClient client) {
        this.client = client;
    }

    /** Set the account display name. */
    public SuccessResult setProfileName(String sessionId, String name) {
        return client.request(
            HttpMethod.PUT,
            "/api/sessions/" + encodeSegment(sessionId) + "/profile/name",
            null,
            new SetProfileNameRequest(name),
            SuccessResult.class);
    }

    /** Set the account about/status text (an empty string clears it). */
    public SuccessResult setProfileStatus(String sessionId, String status) {
        return client.request(
            HttpMethod.PUT,
            "/api/sessions/" + encodeSegment(sessionId) + "/profile/status",
            null,
            new SetProfileStatusRequest(status),
            SuccessResult.class);
    }

    /** Set the account profile picture from a {@code url} or a {@code base64} + {@code mimetype} pair. */
    public SuccessResult setProfilePicture(String sessionId, SetProfilePictureRequest body) {
        return client.request(
            HttpMethod.PUT,
            "/api/sessions/" + encodeSegment(sessionId) + "/profile/picture",
            null,
            body,
            SuccessResult.class);
    }

    /** Remove the account profile picture. */
    public SuccessResult deleteProfilePicture(String sessionId) {
        return client.request(
            HttpMethod.DELETE,
            "/api/sessions/" + encodeSegment(sessionId) + "/profile/picture",
            null,
            null,
            SuccessResult.class);
    }
}
